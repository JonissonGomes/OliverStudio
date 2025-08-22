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
      const data = await apiRequest<any[]>(`/clientes`);
      const formatted: Cliente[] = (data || []).map((c: any) => ({
        id: String(c._id), // ✅ Converter _id para id
        nome: c.nome,
        email: c.email,
        telefone: c.telefone,
        cidade: c.cidade,
        dataNascimento: c.dataNascimento,
        mensagem: c.mensagem,
        origem: c.origem,
        eventos: c.eventos || [],
        isLead: c.isLead,
        // Campos de conversão de leads
        convertedFromLead: c.convertedFromLead,
        leadConversionDate: c.leadConversionDate,
        leadSource: c.leadSource,
        leadMessage: c.leadMessage,
        leadEventType: c.leadEventType,
      }));
      setClientes(formatted);
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
      const data = await apiRequest<any[]>(`/leads`);
      
      // Converter dados do backend para o formato esperado pelo frontend
      const formattedLeads = (data || []).map((l: any) => ({
        id: String(l._id),
        nome: l.nome,
        email: l.email,
        telefone: l.telefone,
        tipoEvento: l.tipoEvento,
        mensagem: l.mensagem,
        origem: l.origem,
        comoConheceu: l.comoConheceu,
        eventos: [],
        isLead: true
      }));
      
      setLeads(formattedLeads);
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

export const useLeadConversionAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAnalytics = async (from?: string, to?: string) => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      
      const url = `/analytics/lead-conversion${params.toString() ? `?${params.toString()}` : ''}`;
      const analyticsData = await apiRequest<any>(url);
      setData(analyticsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar analytics de conversão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchAnalytics 
  };
};