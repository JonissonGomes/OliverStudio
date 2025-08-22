import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  roles: string[];
  status: 'approved' | 'pending' | 'rejected';
  phone?: string;
  department?: string;
}

export const useProfile = () => {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await apiRequest<{ user: any }>(`/auth/me`);
      const u = res.user || {};
      setProfile({
        id: u.id,
        full_name: u.fullName || '',
        email: u.email,
        roles: Array.isArray(u.roles) ? u.roles : [],
        status: u.status || 'pending',
        phone: u.phone || '',
      });
    } catch (e) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProfile = async (updates: { full_name?: string; phone?: string }) => {
    try {
      const payload: any = {};
      if (updates.full_name !== undefined) payload.fullName = updates.full_name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      const res = await apiRequest<{ user: any }>(`/auth/me`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const u = res.user || {};
      setProfile({
        id: u.id,
        full_name: u.fullName || '',
        email: u.email,
        roles: Array.isArray(u.roles) ? u.roles : [],
        status: u.status || 'pending',
        phone: u.phone || '',
      });
      await refresh();
      return true;
    } catch (e) {
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};