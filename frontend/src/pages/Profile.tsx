import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, UserCheck } from 'lucide-react';

export default function Profile() {
  const { profile, loading, updateProfile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const success = await updateProfile(formData);
      if (success) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o perfil. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Administrador',
      gerente: 'Gerente',
      fotografo: 'Fotógrafo',
      assistente: 'Assistente'
    };
    return roleLabels[role] || role;
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };
    return statusLabels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Complete suas informações pessoais
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Atualize suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  O e-mail não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label>Cargos</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  {(profile?.roles || []).length > 0 ? (
                    (profile?.roles || []).map((r) => (
                      <Badge key={r} variant="outline">{getRoleLabel(r)}</Badge>
                    ))
                  ) : (
                    <Badge variant="outline">Não definido</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">(definidos pelo administrador)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status da Conta</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(profile?.status || 'pending')}>
                    {profile?.status ? getStatusLabel(profile.status) : 'Pendente'}
                  </Badge>
                  {profile?.status === 'pending' && (
                    <p className="text-sm text-muted-foreground">
                      Aguardando aprovação do administrador
                    </p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar Perfil'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}