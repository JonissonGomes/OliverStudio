import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Profile } from '@/hooks/useProfile';
import { Check, X, User, Mail, Phone, Building, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface UserApprovalCardProps {
  profile: Profile;
  onApprove: (userId: string, role: string) => Promise<boolean>;
  onReject: (userId: string) => Promise<boolean>;
  onRoleChange: (userId: string, role: string) => Promise<boolean>;
  onRoleRemove?: (userId: string, role: string) => Promise<boolean>;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  fotografo: 'Fotógrafo',
  assistente: 'Assistente'
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export const UserApprovalCard: React.FC<UserApprovalCardProps> = ({
  profile,
  onApprove,
  onReject,
  onRoleChange,
  onRoleRemove
}) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>(profile.roles?.[0] || 'assistente');
  const [loading, setLoading] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  
  // Verifica se é o próprio usuário admin tentando editar a si mesmo
  const isCurrentUser = user?.id === profile.id;
  const isAdminEditingSelf = isCurrentUser && (profile.roles || []).includes('admin');
  const availableRoles = ['assistente','fotografo','gerente','admin'].filter(r => !(profile.roles||[]).includes(r));

  const handleApprove = async () => {
    setLoading(true);
    const success = await onApprove(profile.id, selectedRole);
    if (success) {
      toast.success('Usuário aprovado com sucesso');
    } else {
      toast.error('Erro ao aprovar usuário');
    }
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    const success = await onReject(profile.id);
    if (success) {
      toast.success('Usuário rejeitado');
    } else {
      toast.error('Erro ao rejeitar usuário');
    }
    setLoading(false);
  };

  const handleRoleChange = async (newRole: string) => {
    setLoading(true);
    const success = await onRoleChange(profile.id, newRole);
    if (success) {
      toast.success('Cargo atualizado com sucesso');
      setSelectedRole(newRole);
    } else {
      toast.error('Erro ao atualizar cargo');
    }
    setLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2 flex-1">
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">{profile.full_name}</CardTitle>
        </div>
        <Badge className={STATUS_COLORS[profile.status]}>
          {profile.status === 'pending' && 'Pendente'}
          {profile.status === 'approved' && 'Aprovado'}
          {profile.status === 'rejected' && 'Rejeitado'}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {profile.email && (
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate" title={profile.email}>{profile.email}</span>
            </div>
          )}
          
          {profile.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}
          
          {profile.department && (
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{profile.department}</span>
            </div>
          )}
          
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Cargos</span>
              <Popover open={rolePickerOpen} onOpenChange={setRolePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Adicionar cargo
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-56" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar cargo..." />
                    <CommandList>
                      <CommandEmpty>Nenhum cargo disponível</CommandEmpty>
                      <CommandGroup>
                        {availableRoles.map((r) => (
                          <CommandItem
                            key={r}
                            value={r}
                            onSelect={async () => {
                              const ok = await onRoleChange(profile.id, r);
                              if (ok) {
                                toast.success('Cargo adicionado');
                                setRolePickerOpen(false);
                              } else {
                                toast.error('Erro ao adicionar cargo');
                              }
                            }}
                          >
                            {ROLE_LABELS[r] || r}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.roles || []).map((r) => {
                const isSelfAdmin = isCurrentUser && r === 'admin';
                return (
                  <AlertDialog key={`${profile.id}-${r}`}>
                    <Badge variant="outline" className="flex items-center gap-1.5 px-2 py-1">
                      {ROLE_LABELS[r] || r}
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                          disabled={isSelfAdmin}
                          aria-label={`Remover ${ROLE_LABELS[r] || r}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                    </Badge>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover cargo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Confirmar a remoção do cargo "{ROLE_LABELS[r] || r}" deste usuário?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                          if (!onRoleRemove) return;
                          const ok = await onRoleRemove(profile.id, r);
                          if (ok) toast.success('Cargo removido'); else toast.error('Erro ao remover cargo');
                        }}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                );
              })}
              {(!profile.roles || profile.roles.length === 0) && (
                <Badge variant="outline" className="px-2 py-1">Nenhum cargo definido</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex flex-col space-y-3">
            {profile.status === 'pending' && !isCurrentUser && (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleApprove}
                  disabled={loading}
                  size="sm"
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
                <Button 
                  onClick={handleReject}
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
              </div>
            )}
            
            {isCurrentUser && profile.status === 'pending' && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                Este é seu próprio perfil. Você não pode aprovar ou rejeitar a si mesmo.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};