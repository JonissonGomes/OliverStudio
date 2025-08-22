import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Fotografo } from '@/types';
import { apiRequest } from '@/lib/api';

export interface CombinedFotografo {
  id: string;
  nome: string;
  email?: string;
  contato?: string;
  especialidades?: string[];
  isUser: boolean; // true se for usuário com cargo, false se for cadastrado manualmente
  userId?: string; // ID do usuário se for usuário com cargo
}

export const useCombinedFotografos = () => {
  const [fotografos, setFotografos] = useState<CombinedFotografo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Verificar se o usuário tem permissão para editar fotógrafos
  const canEditFotografos = user?.roles?.some(role => 
    ['admin', 'assistente', 'gerente'].includes(role)
  ) || false;

  const fetchCombinedFotografos = async () => {
    if (!user) {
      setFotografos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar fotógrafos cadastrados manualmente
      const fotografosData = await apiRequest<Fotografo[]>(`/fotografos`);
      
      // Buscar usuários com cargo de fotógrafo
      const usersData = await apiRequest<any[]>(`/users/fotografos`);
      
      // Combinar os dados
      const combined: CombinedFotografo[] = [];
      
      // Adicionar fotógrafos cadastrados manualmente
      fotografosData.forEach(f => {
        combined.push({
          id: f.id,
          nome: f.nome,
          email: f.email,
          contato: f.contato,
          especialidades: f.especialidades,
          isUser: false
        });
      });
      
      // Adicionar usuários com cargo de fotógrafo
      usersData.forEach(u => {
        // Construir nome completo a partir de first_name e last_name
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        if (fullName) {
          // Verificar se já não foi adicionado (por nome ou por ser o mesmo usuário)
          const alreadyExists = combined.find(f => {
            // Se for usuário com cargo, verificar por userId
            if (f.isUser && f.userId === u.id) return true;
            // Se for fotógrafo cadastrado, verificar por nome
            if (!f.isUser && f.nome.toLowerCase() === fullName.toLowerCase()) return true;
            return false;
          });
          
          if (!alreadyExists) {
            combined.push({
              id: `user_${u.id}`,
              nome: fullName,
              email: u.email,
              contato: '', // Usuários não têm telefone na API atual
              especialidades: u.especialidades || [], // Usar especialidades do backend
              isUser: true,
              userId: u.id
            });
          }
        }
      });
      
      setFotografos(combined);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar fotógrafos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombinedFotografos();
  }, [user]);

  const addFotografo = async (fotografo: Omit<Fotografo, 'id'>) => {
    if (!user) return;

    try {
      await apiRequest(`/fotografos`, { method: 'POST', body: JSON.stringify(fotografo) });
      await fetchCombinedFotografos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar fotógrafo');
      throw err;
    }
  };

  const updateFotografo = async (id: string, fotografo: Partial<Fotografo>) => {
    if (!user) return;

    try {
      // Se for um usuário com cargo, editar via rota de usuários
      if (id.startsWith('user_')) {
        const userId = id.replace('user_', '');
        await apiRequest(`/users/${userId}`, { 
          method: 'PUT', 
          body: JSON.stringify({
            fullName: fotografo.nome,
            email: fotografo.email,
            especialidades: fotografo.especialidades // Incluir especialidades
          }) 
        });
        
        // Recarregar dados do backend para garantir consistência
        await fetchCombinedFotografos();
      } else {
        // Se for fotógrafo cadastrado, editar via rota de fotógrafos
        await apiRequest(`/fotografos/${id}`, { method: 'PUT', body: JSON.stringify(fotografo) });
        await fetchCombinedFotografos();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar fotógrafo');
      throw err;
    }
  };

  const deleteFotografo = async (id: string) => {
    if (!user) return;

    try {
      // Se for um usuário com cargo, remover o cargo via rota de usuários
      if (id.startsWith('user_')) {
        const userId = id.replace('user_', '');
        await apiRequest(`/users/${userId}/roles`, { 
          method: 'DELETE', 
          body: JSON.stringify({ role: 'fotografo' }) 
        });
      } else {
        // Se for fotógrafo cadastrado, deletar via rota de fotógrafos
        await apiRequest(`/fotografos/${id}`, { method: 'DELETE' });
      }
      
      // Recarregar dados após exclusão
      await fetchCombinedFotografos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar fotógrafo');
      throw err;
    }
  };

  return {
    fotografos,
    loading,
    error,
    canEditFotografos,
    addFotografo,
    updateFotografo,
    deleteFotografo,
    refetch: fetchCombinedFotografos,
  };
}; 