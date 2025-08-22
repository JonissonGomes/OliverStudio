import { useAuth } from '@/contexts/AuthContext';

export const useUserRoles = () => {
  const { user } = useAuth();
  const userRoles = user?.roles || [];

  const hasRole = (role: string) => userRoles.includes(role);
  const isAdmin = () => hasRole('admin');
  const isModerator = () => hasRole('moderator');

  return {
    userRoles,
    hasRole,
    isAdmin,
    isModerator,
  };
};