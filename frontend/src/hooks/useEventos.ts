import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types';
import { apiRequest } from '@/lib/api';

export const useEventos = () => {
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEventos = async () => {
    if (!user) {
      setEventos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<any[]>(`/eventos`);
      const formatted: Event[] = (data || []).map((e: any) => ({
        id: String(e._id), // ✅ Usar _id do MongoDB
        cliente: e.cliente,
        email: e.email,
        telefone: e.telefone,
        tipoEvento: e.tipoEvento,
        data: e.data,
        inicio: e.inicio,
        termino: e.termino,
        local: e.local,
        cidade: e.cidade,
        descricao: e.descricao || '',
        preco: Number(e.preco),
        fotografos: e.fotografos || [],
        driveLink: e.driveLink,
        status: e.status,
        recorrencia: e.recorrencia,
      }));
      setEventos(formatted);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [user]);

  const addEvento = async (evento: Omit<Event, 'id'>) => {
    if (!user) return;

    try {
      await apiRequest(`/eventos`, { method: 'POST', body: JSON.stringify(evento) });
      await fetchEventos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar evento');
      throw err;
    }
  };

  const updateEvento = async (id: string, evento: Partial<Event>) => {
    if (!user) return;

    try {
      await apiRequest(`/eventos/${id}`, { method: 'PUT', body: JSON.stringify(evento) });
      await fetchEventos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar evento');
      throw err;
    }
  };

  const deleteEvento = async (id: string) => {
    if (!user) return;

    try {
      await apiRequest(`/eventos/${id}`, { method: 'DELETE' });
      await fetchEventos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar evento');
      throw err;
    }
  };

  return {
    eventos,
    loading,
    error,
    addEvento,
    updateEvento,
    deleteEvento,
    refetch: fetchEventos
  };
};