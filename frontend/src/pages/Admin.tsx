import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserApprovalCard } from '@/components/UserApprovalCard';
import { useAdminProfiles } from '@/hooks/useAdminProfiles';
import { Users, UserCheck, UserX, Search, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Admin: React.FC = () => {
  const { profiles, loading, approveUser, rejectUser, updateUserRole, removeUserRole, refetch } = useAdminProfiles();
  const [searchTerm, setSearchTerm] = useState('');

  const pendingUsers = profiles.filter(p => p.status === 'pending');
  const approvedUsers = profiles.filter(p => p.status === 'approved');
  const rejectedUsers = profiles.filter(p => p.status === 'rejected');

  const filteredProfiles = (profilesList: typeof profiles) => {
    if (!searchTerm) return profilesList;
    return profilesList.filter(profile => 
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(profile.roles) ? profile.roles.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (profile.department && profile.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e aprovações do sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <UserCheck className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={refetch} variant="outline">
          Atualizar
        </Button>
      </div>

      {/* User Management Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Pendentes</span>
            {pendingUsers.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingUsers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Aprovados</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center space-x-2">
            <UserX className="h-4 w-4" />
            <span>Rejeitados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles(pendingUsers).map((profile) => (
              <UserApprovalCard
                key={profile.id}
                profile={profile}
                onApprove={approveUser}
                onReject={rejectUser}
                onRoleChange={updateUserRole}
                onRoleRemove={removeUserRole}
              />
            ))}
          </div>
          {filteredProfiles(pendingUsers).length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum usuário pendente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Todos os usuários foram processados ou não há novos registros.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles(approvedUsers).map((profile) => (
              <UserApprovalCard
                key={profile.id}
                profile={profile}
                onApprove={approveUser}
                onReject={rejectUser}
                onRoleChange={updateUserRole}
                onRoleRemove={removeUserRole}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles(rejectedUsers).map((profile) => (
              <UserApprovalCard
                key={profile.id}
                profile={profile}
                onApprove={approveUser}
                onReject={rejectUser}
                onRoleChange={updateUserRole}
                onRoleRemove={removeUserRole}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;