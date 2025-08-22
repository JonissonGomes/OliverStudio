import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Fotografo } from '@/types';
import { apiRequest } from '@/lib/api';

export const useFotografos = () => {
  const [fotografos, setFotografos] = useState<Fotografo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFotografos = async () => {
    if (!user) {
      setFotografos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<Fotografo[]>(`/fotografos`);
      setFotografos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar fotógrafos');
      console.error('Erro ao buscar fotógrafos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFotografos();
  }, [user]);

  const addFotografo = async (fotografo: Omit<Fotografo, 'id'>) => {
    if (!user) return;

    try {
      await apiRequest(`/fotografos`, { method: 'POST', body: JSON.stringify(fotografo) });
      await fetchFotografos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar fotógrafo');
      throw err;
    }
  };

  const updateFotografo = async (id: string, fotografo: Partial<Fotografo>) => {
    if (!user) return;

    try {
      await apiRequest(`/fotografos/${id}`, { method: 'PUT', body: JSON.stringify(fotografo) });
      await fetchFotografos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar fotógrafo');
      throw err;
    }
  };

  const deleteFotografo = async (id: string) => {
    if (!user) return;

    try {
      await apiRequest(`/fotografos/${id}`, { method: 'DELETE' });
      await fetchFotografos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar fotógrafo');
      throw err;
    }
  };

  return {
    fotografos,
    loading,
    error,
    addFotografo,
    updateFotografo,
    deleteFotografo,
    refetch: fetchFotografos,
  };
};
