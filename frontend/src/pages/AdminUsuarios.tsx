import { useState } from 'react';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCheck, UserX, Shield, Search, Plus, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';

const CARGOS_DISPONIVEIS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'moderator', label: 'Moderador' },
  { value: 'user', label: 'Usuário' }
];

export default function AdminUsuarios() {
  const { profiles, loading, updateProfileStatus, assignRole, removeRole } = useUserProfiles();
  const { isAdmin } = useUserRoles();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('status-pending');
  const [page, setPage] = useState<number>(1);
  const pageSize = 9;

  const getRoleLabel = (role: string) => CARGOS_DISPONIVEIS.find(c => c.value === role)?.label || role;

  function RoleManager({ profileId, roles }: { profileId: string; roles: string[] }) {
    const [open, setOpen] = useState(false);
    const roleOptions = CARGOS_DISPONIVEIS.filter((c) => !(roles || []).includes(c.value));

    return (
      <div className="flex flex-col gap-2">
        {roles?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => {
              const isSelfAdmin = user?.id === profileId && role === 'admin';
              return (
                <AlertDialog key={`${profileId}-${role}`}>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getRoleLabel(role)}
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                        disabled={isSelfAdmin}
                        aria-label={`Remover ${getRoleLabel(role)}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                  </Badge>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover cargo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Confirmar a remoção do cargo "{getRoleLabel(role)}" deste usuário.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => {
                        try {
                          await handleRemoveRole(profileId, role);
                        } finally {
                          // noop
                        }
                      }}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              );
            })}
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-44 justify-start">
              <Plus className="h-4 w-4 mr-2" /> Adicionar cargo
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-56" align="start">
            <Command>
              <CommandInput placeholder="Buscar cargo..." />
              <CommandList>
                <CommandEmpty>Nenhum cargo disponível</CommandEmpty>
                <CommandGroup>
                  {roleOptions.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={async () => {
                        try {
                          await handleAssignRole(profileId, opt.value);
                          setOpen(false);
                        } catch {}
                      }}
                    >
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (!isAdmin()) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">Acesso Negado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Você precisa ser administrador para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || profile.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusWeight = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'approved': return 1;
      case 'rejected': return 2;
      default: return 3;
    }
  };

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortOption === 'status-pending') {
      const wa = statusWeight(a.status);
      const wb = statusWeight(b.status);
      if (wa !== wb) return wa - wb;
      return (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name);
    }
    if (sortOption === 'status-approved') {
      const wa = a.status === 'approved' ? 0 : 1;
      const wb = b.status === 'approved' ? 0 : 1;
      if (wa !== wb) return wa - wb;
      return (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name);
    }
    if (sortOption === 'status-rejected') {
      const wa = a.status === 'rejected' ? 0 : 1;
      const wb = b.status === 'rejected' ? 0 : 1;
      if (wa !== wb) return wa - wb;
      return (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name);
    }
    // nome
    return (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name);
  });

  const totalPages = Math.max(1, Math.ceil(sortedProfiles.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProfiles = sortedProfiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApproveUser = async (profileId: string) => {
    try {
      await updateProfileStatus(profileId, 'approved');
      toast({ title: "Usuário aprovado", description: "O usuário foi aprovado com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro", description: error?.message || "Erro ao aprovar usuário.", variant: "destructive" });
    }
  };

  const handleRejectUser = async (profileId: string) => {
    try {
      await updateProfileStatus(profileId, 'rejected');
      toast({ title: "Usuário rejeitado", description: "O usuário foi rejeitado." });
    } catch (error: any) {
      toast({ title: "Erro", description: error?.message || "Erro ao rejeitar usuário.", variant: "destructive" });
    }
  };

  const handleAssignRole = async (profileId: string, role: string) => {
    try {
      await assignRole(profileId, role);
      toast({ title: "Cargo atribuído", description: `Cargo ${role} atribuído com sucesso.` });
    } catch (error: any) {
      toast({ title: "Erro", description: error?.message || "Erro ao atribuir cargo.", variant: "destructive" });
    }
  };

  const handleRemoveRole = async (profileId: string, role: string) => {
    try {
      await removeRole(profileId, role);
      toast({ title: "Cargo removido", description: `Cargo ${role} removido com sucesso.` });
    } catch (error: any) {
      toast({ title: "Erro", description: error?.message || "Erro ao remover cargo.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração de Usuários</h1>
          <p className="text-muted-foreground">Gerencie status e cargos dos usuários</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Filtro</CardTitle>
            <CardDescription>Refine sua busca</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar por nome ou email" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOption} onValueChange={(v) => { setSortOption(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status-pending">Pendentes primeiro</SelectItem>
                  <SelectItem value="status-approved">Aprovados primeiro</SelectItem>
                  <SelectItem value="status-rejected">Rejeitados primeiro</SelectItem>
                  <SelectItem value="name">Nome (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedProfiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{profile.first_name} {profile.last_name}</span>
                {getStatusBadge(profile.status)}
              </CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              {profile.roles?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.roles.map((role) => (
                    <Badge key={`${profile.id}-badge-${role}`} variant="outline">{getRoleLabel(role)}</Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <RoleManager profileId={profile.id} roles={profile.roles || []} />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handleApproveUser(profile.id)}>Aprovar</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleRejectUser(profile.id)}>Rejeitar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages} — {sortedProfiles.length} usuário(s)
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próxima</Button>
        </div>
      </div>
    </div>
  );
}