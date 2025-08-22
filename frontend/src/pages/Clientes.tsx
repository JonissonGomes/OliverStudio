import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClientes } from '@/hooks/useClientes';
import { useEventos } from '@/hooks/useEventos';
import { InputMask } from '@/components/ui/input-mask';
import { Cliente, TIPOS_EVENTO } from '@/types';
import { Plus, Edit, Trash2, Search, Users, Mail, Phone, MapPin, Calendar, UserPlus, Globe } from 'lucide-react';
import { getEventTypeColor } from '@/utils/eventColors';
import { useToast } from '@/hooks/use-toast';

const Clientes: React.FC = () => {
  const { toast } = useToast();
  const { clientes, addCliente, updateCliente, deleteCliente } = useClientes();
  const { eventos } = useEventos();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    dataNascimento: '',
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cidade: '',
      dataNascimento: '',
    });
    setEditingCliente(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, {
          nome: formData.nome!,
          email: formData.email!,
          telefone: formData.telefone || '',
          cidade: formData.cidade || '',
          dataNascimento: formData.dataNascimento || '',
        });
        toast({ title: "Cliente atualizado", description: "O cliente foi atualizado com sucesso" });
      } else {
        await addCliente({
          nome: formData.nome!,
          email: formData.email!,
          telefone: formData.telefone || '',
          cidade: formData.cidade || '',
          dataNascimento: formData.dataNascimento || '',
          eventos: [],
        });
        toast({ title: "Cliente criado", description: "O cliente foi criado com sucesso" });
      }
      resetForm();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar o cliente", variant: "destructive" });
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData(cliente);
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCliente(id);
      toast({ title: "Cliente excluído", description: "O cliente foi excluído com sucesso" });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o cliente", variant: "destructive" });
    }
  };

  const getClienteEventos = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return [];
    // Vincula por email ou nome, já que o campo eventos pode não estar populado
    return eventos.filter(evento => evento.email === cliente.email || evento.cliente === cliente.nome);
  };

  const filteredClientes = clientes.filter(cliente => {
    return cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clientes</h1>
        <Button onClick={() => setIsFormOpen(true)} className="shadow-elegant w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Busca */}
      <Card className="shadow-soft">
        <CardContent className="pt-4 sm:pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Cliente */}
      {isFormOpen && (
        <Card className="shadow-soft animate-slide-up">
          <CardHeader>
            <CardTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
            <CardDescription>
              Gerencie as informações do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    maxLength={120}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={120}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <InputMask
                    id="telefone"
                    mask="phone"
                    value={formData.telefone || ''}
                    onChange={(value) => setFormData({ ...formData, telefone: value })}
                    placeholder="(11) 9 1234-5678"
                    maxLength={15}
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade || ''}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Cidade onde reside"
                    maxLength={60}
                  />
                </div>
                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento || ''}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingCliente ? 'Atualizar' : 'Criar'} Cliente
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredClientes.length > 0 ? (
          filteredClientes.map((cliente) => {
            const clienteEventos = getClienteEventos(cliente.id);
            
            return (
              <Card key={cliente.id} className="shadow-soft hover:shadow-elegant transition-shadow min-h-[250px] flex flex-col">
                <CardContent className="pt-4 sm:pt-6 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 flex-1">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-semibold break-words">{cliente.nome}</h3>
                        {cliente.isLead && (
                          <Badge variant="secondary">Lead</Badge>
                        )}
                        {cliente.convertedFromLead && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Ex-Lead
                          </Badge>
                        )}
                      </div>
                      {cliente.mensagem && cliente.isLead && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-3">{cliente.mensagem}</p>
                      )}
                      
                      {/* Informações de conversão de lead */}
                      {cliente.convertedFromLead && (
                        <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                              Convertido de Lead
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-600 dark:text-blue-400">
                            {cliente.leadSource && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Origem:</span>
                                <span className="capitalize">{cliente.leadSource}</span>
                              </div>
                            )}
                            {cliente.leadEventType && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Tipo:</span>
                                <span className="capitalize">{cliente.leadEventType}</span>
                              </div>
                            )}
                            {cliente.leadMessage && (
                              <div className="sm:col-span-2">
                                <span className="font-medium">Mensagem:</span>
                                <p className="mt-1 text-blue-700 dark:text-blue-300 line-clamp-2 italic">
                                  "{cliente.leadMessage}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="break-all">{cliente.email}</span>
                        </div>
                        {cliente.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">{cliente.telefone}</span>
                          </div>
                        )}
                        {cliente.cidade && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">{cliente.cidade}</span>
                          </div>
                        )}
                        {cliente.dataNascimento && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">{new Date(cliente.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>

                      {clienteEventos.length > 0 && (
                        <div className="flex-1">
                          <h4 className="text-xs font-medium mb-2">Eventos:</h4>
                          <div className="flex flex-wrap gap-2">
                            {clienteEventos.slice(0, 3).map((evento) => (
                              <Badge 
                                key={evento.id} 
                                className={`text-xs ${getEventTypeColor(evento.tipoEvento)}`}
                              >
                                {TIPOS_EVENTO.find(t => t.value === evento.tipoEvento)?.label} - {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </Badge>
                            ))}
                          </div>
                          {clienteEventos.length > 3 && (
                            <div className="text-xs text-muted-foreground mt-2">
                              +{clienteEventos.length - 3} mais evento{clienteEventos.length - 3 !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-0 w-auto">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            aria-label="Excluir cliente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o cliente <strong>{cliente.nome}</strong>?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cliente.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(cliente)}
                        aria-label="Editar cliente"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card className="shadow-soft">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Tente ajustar o termo de busca'
                    : 'Comece criando seu primeiro cliente'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clientes;