import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/lib/api';

interface AuthUser {
	id: string;
	email: string;
	roles: string[];
	fullName?: string;
	phone?: string;
	status?: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  isAuthenticated: boolean;
	user: AuthUser | null;
  isApproved: boolean;
  userRole: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
	refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      isAuthenticated: false,
      user: null,
			isApproved: true,
      userRole: null,
      isAdmin: false,
      isLoading: false,
      login: async () => ({ success: false, error: 'Auth indisponível' }),
      logout: async () => {},
			register: async () => ({ success: false, error: 'Auth indisponível' }),
			refresh: async () => {}
    } as AuthContextType;
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<AuthUser | null>(null);
  const [isApproved, setIsApproved] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();
	const location = useLocation();

	const bootstrap = async () => {
		const token = localStorage.getItem('auth_token');
		if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
		try {
			const { user } = await api.auth.me();
        setIsAuthenticated(true);
			setUser(user as AuthUser);
			const role = (user.roles && user.roles[0]) || null;
			setUserRole(role);
			setIsAdmin(user.roles?.includes('admin') || false);
			setIsApproved((user as any).status ? (user as any).status === 'approved' : true);
		} catch {
			localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUser(null);
		} finally {
        setIsLoading(false);
      }
	};

	useEffect(() => {
		bootstrap();
		// Também revalida ao entrar em rotas /app/*
		// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

	useEffect(() => {
		if (location.pathname.startsWith('/app')) {
			bootstrap();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
			const { token, user } = await api.auth.login(email, password);
			localStorage.setItem('auth_token', token);
			setIsAuthenticated(true);
			setUser(user as AuthUser);
			const role = (user.roles && user.roles[0]) || null;
			setUserRole(role);
			setIsAdmin(user.roles?.includes('admin') || false);
			setIsApproved((user as any).status ? (user as any).status === 'approved' : true);
        return { success: true };
		} catch (err: any) {
			return { success: false, error: err?.message || 'Erro inesperado' };
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
			const { token, user } = await api.auth.register(email, password, fullName);
			localStorage.setItem('auth_token', token);
			setIsAuthenticated(true);
			setUser(user as AuthUser);
			const role = (user.roles && user.roles[0]) || null;
			setUserRole(role);
			setIsAdmin(user.roles?.includes('admin') || false);
			setIsApproved((user as any).status ? (user as any).status === 'approved' : true);
      return { success: true };
		} catch (err: any) {
			return { success: false, error: err?.message || 'Erro inesperado' };
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
		setIsApproved(true);
    setUserRole(null);
    setIsAdmin(false);
    setIsLoading(false);
		localStorage.removeItem('auth_token');
		navigate('/app/login', { replace: true });
	};

	const refresh = async () => {
		await bootstrap();
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      isApproved, 
      userRole, 
      isAdmin, 
      isLoading,
      login, 
      logout, 
			register,
			refresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
