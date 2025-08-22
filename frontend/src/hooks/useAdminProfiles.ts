import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Profile } from '@/hooks/useProfile';

interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  roles: string[];
  created_at: string;
}

const ROLE_ORDER = ['admin', 'gerente', 'fotografo', 'assistente'] as const;

function mapBackendToProfile(u: BackendUser): Profile {
  const roles = Array.isArray(u.roles) ? u.roles : [];
  return {
    id: u.id,
    full_name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
    email: u.email,
    roles,
    status: u.status,
    department: undefined,
    phone: undefined,
  } as Profile;
}

export const useAdminProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const users = await apiRequest<BackendUser[]>(`/users`);
      setProfiles(users.map(mapBackendToProfile));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const approveUser = async (userId: string, role: string): Promise<boolean> => {
    try {
      // Garante que pelo menos um cargo foi atribuído
      await updateUserRole(userId, role);
      // Depois aprova
      await apiRequest(`/users/${userId}/status`, { method: 'POST', body: JSON.stringify({ status: 'approved' }) });
      await fetchProfiles();
      return true;
    } catch {
      return false;
    }
  };

  const rejectUser = async (userId: string): Promise<boolean> => {
    try {
      await apiRequest(`/users/${userId}/status`, { method: 'POST', body: JSON.stringify({ status: 'rejected' }) });
      await fetchProfiles();
      return true;
    } catch {
      return false;
    }
  };

  const updateUserRole = async (userId: string, role: string): Promise<boolean> => {
    try {
      // Apenas adiciona o cargo solicitado (a remoção específica é feita em outras telas)
      await apiRequest(`/users/${userId}/roles`, { method: 'POST', body: JSON.stringify({ role }) });
      await fetchProfiles();
      return true;
    } catch {
      return false;
    }
  };

  const removeUserRole = async (userId: string, role: string): Promise<boolean> => {
    try {
      await apiRequest(`/users/${userId}/roles`, { method: 'DELETE', body: JSON.stringify({ role }) });
      await fetchProfiles();
      return true;
    } catch {
      return false;
    }
  };

  return { profiles, loading, error, approveUser, rejectUser, updateUserRole, removeUserRole, refetch: fetchProfiles };
};