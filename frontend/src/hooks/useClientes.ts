import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Cliente } from '@/types';
import { apiRequest } from '@/lib/api';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchClientes = async () => {
    if (!user) {
      setClientes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<Cliente[]>(`/clientes`);
      setClientes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [user]);

  const addCliente = async (cliente: Omit<Cliente, 'id'>) => {
    if (!user) return;

    try {
      await apiRequest(`/clientes`, { method: 'POST', body: JSON.stringify(cliente) });
      await fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar cliente');
      throw err;
    }
  };

  const updateCliente = async (id: string, cliente: Partial<Cliente>) => {
    if (!user) return;

    try {
      await apiRequest(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(cliente) });
      await fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
      throw err;
    }
  };

  const deleteCliente = async (id: string) => {
    if (!user) return;

    try {
      await apiRequest(`/clientes/${id}`, { method: 'DELETE' });
      await fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar cliente');
      throw err;
    }
  };

  return {
    clientes,
    loading,
    error,
    addCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes
  };
};

export const useLeads = () => {
  const [leads, setLeads] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLeads = async () => {
    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await apiRequest<Cliente[]>(`/clientes/leads`);
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  return { leads, loading, error, refetch: fetchLeads };
};