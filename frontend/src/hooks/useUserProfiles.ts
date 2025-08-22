import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  roles: string[];
  created_at: string;
}

export const useUserProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<UserProfile[]>(`/users`);
      setProfiles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const updateProfileStatus = async (profileId: string, status: 'approved' | 'rejected' | 'pending') => {
    await apiRequest(`/users/${profileId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
    await fetchProfiles();
  };

  const assignRole = async (profileId: string, role: string) => {
    await apiRequest(`/users/${profileId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    await fetchProfiles();
  };

  const removeRole = async (profileId: string, role: string) => {
    await apiRequest(`/users/${profileId}/roles`, {
      method: 'DELETE',
      body: JSON.stringify({ role })
    });
    await fetchProfiles();
  };

  return {
    profiles,
    loading,
    error,
    updateProfileStatus,
    assignRole,
    removeRole,
    refetch: fetchProfiles
  };
};