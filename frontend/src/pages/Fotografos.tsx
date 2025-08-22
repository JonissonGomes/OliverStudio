import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCombinedFotografos, CombinedFotografo } from '@/hooks/useCombinedFotografos';
import { useEventos } from '@/hooks/useEventos';
import { TIPOS_EVENTO } from '@/types';
import { Plus, Edit, Trash2, Search, User, Mail, Phone, Calendar, Coins, Shield } from 'lucide-react';
import { getEventTypeColor } from '@/utils/eventColors';
import { useToast } from '@/hooks/use-toast';
import { InputMask } from '@/components/ui/input-mask';
import { Fotografo } from '@/types';

const Fotografos: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { fotografos, addFotografo, updateFotografo, deleteFotografo, canEditFotografos } = useCombinedFotografos();
  const { eventos } = useEventos();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFotografo, setEditingFotografo] = useState<CombinedFotografo | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<CombinedFotografo>>({
    nome: '',
    email: '',
    contato: '',
    especialidades: []
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      contato: '',
      especialidades: []
    });
    setEditingFotografo(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    // Validação de telefone apenas para fotógrafos cadastrados
    if (!editingFotografo?.isUser && !formData.contato?.trim()) {
      toast({ title: 'Erro', description: 'Telefone é obrigatório', variant: 'destructive' });
      return;
    }

    try {
      if (editingFotografo) {
        // Preparar dados para atualização
        const updateData: Partial<CombinedFotografo> = {
          nome: formData.nome,
          email: formData.email,
          especialidades: formData.especialidades
        };
        
        // Incluir telefone apenas se não for usuário com cargo
        if (!editingFotografo.isUser) {
          updateData.contato = formData.contato;
        }
        
        await updateFotografo(editingFotografo.id, updateData);
        toast({ title: 'Sucesso', description: 'Fotógrafo atualizado com sucesso' });
      } else {
        // Para novos fotógrafos, usar tipo Fotografo
        const newFotografo: Omit<Fotografo, 'id'> = {
          nome: formData.nome || '',
          email: formData.email || '',
          contato: formData.contato || '',
          especialidades: formData.especialidades || []
        };
        await addFotografo(newFotografo);
        toast({ title: 'Sucesso', description: 'Fotógrafo criado com sucesso' });
      }
      
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar fotógrafo:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao salvar fotógrafo', 
        variant: 'destructive' 
      });
    }
  };

  const handleEdit = (fotografo: CombinedFotografo) => {
    setFormData({
      nome: fotografo.nome,
      email: fotografo.email || '',
      contato: fotografo.isUser ? '' : (fotografo.contato || ''), // Telefone vazio para usuários
      especialidades: fotografo.especialidades || []
    });
    setEditingFotografo(fotografo);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFotografo(id);
      toast({ title: "Fotógrafo excluído", description: "O fotógrafo foi excluído com sucesso" });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o fotógrafo", variant: "destructive" });
    }
  };

  const getFotografoEventos = (fotografo: CombinedFotografo) => {
    // Se for usuário com cargo, buscar por nome (como está nos eventos)
    // Se for fotógrafo cadastrado, buscar por nome
    const eventosDoFotografo = eventos.filter(evento => evento.fotografos.includes(fotografo.nome));
    return eventosDoFotografo;
  };

  const filteredFotografos = fotografos.filter(fotografo => {
    return fotografo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           fotografo.especialidades?.some(esp => esp.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Fotógrafos</h1>
        <div className="flex items-center gap-2">
          {canEditFotografos && (
            <Button onClick={() => setIsFormOpen(true)} className="shadow-elegant w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Fotógrafo
            </Button>
          )}
        </div>
      </div>

      {/* Formulário de Fotógrafo */}
      {isFormOpen && canEditFotografos && (
        <Card className="shadow-soft animate-slide-up">
          <CardHeader>
            <CardTitle>{editingFotografo ? 'Editar Fotógrafo' : 'Novo Fotógrafo'}</CardTitle>
            <CardDescription>
              Gerencie as informações do fotógrafo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome completo do fotógrafo"
                    maxLength={120}
                    required
                  />
                </div>
                {/* Campo de telefone apenas para fotógrafos cadastrados */}
                {!editingFotografo?.isUser && (
                  <div>
                    <Label htmlFor="contato">Telefone *</Label>
                    <InputMask
                      id="contato"
                      mask="phone"
                      value={formData.contato || ''}
                      onChange={(value) => setFormData({ ...formData, contato: value })}
                      placeholder="(11) 9 1234-5678"
                      maxLength={15}
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    maxLength={120}
                  />
                </div>
                <div className="md:col-span-3">
                  <Label>Especialidades</Label>
                  <div className="space-y-3 mt-2">
                    {TIPOS_EVENTO.map((tipo) => (
                      <div key={tipo.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={tipo.value}
                          checked={formData.especialidades?.includes(tipo.value) || false}
                          onCheckedChange={(checked) => {
                            const current = formData.especialidades || [];
                            if (checked) {
                              setFormData({ 
                                ...formData, 
                                especialidades: [...current, tipo.value] 
                              });
                            } else {
                              setFormData({ 
                                ...formData, 
                                especialidades: current.filter(esp => esp !== tipo.value) 
                              });
                            }
                          }}
                        />
                        <Label htmlFor={tipo.value}>{tipo.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingFotografo ? 'Atualizar' : 'Criar'} Fotógrafo
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Fotógrafos */}
      <Card className="shadow-soft">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {filteredFotografos.length > 0 ? (
          filteredFotografos.map((fotografo) => {
            const fotografoEventos = getFotografoEventos(fotografo);
            // Corrigir comparação de datas - converter string para Date corretamente
            const eventosFuturos = fotografoEventos.filter(evento => {
              const dataEvento = new Date(evento.data + 'T00:00:00');
              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0); // Resetar para início do dia
              return dataEvento >= hoje;
            });
            
            return (
              <Card key={fotografo.id} className="shadow-soft hover:shadow-elegant transition-shadow min-h-[320px] flex flex-col">
                <CardContent className="pt-4 sm:pt-6 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 flex-1">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="mb-2">
                        <h3 className="text-sm sm:text-base font-semibold break-words">{fotografo.nome}</h3>
                      </div>
                      
                      <div className="space-y-2 text-xs text-muted-foreground mb-3">
                        {fotografo.contato && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">{fotografo.contato}</span>
                          </div>
                        )}
                        {fotografo.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">{fotografo.email}</span>
                          </div>
                        )}
                      </div>
                      
                      {fotografo.especialidades && fotografo.especialidades.length > 0 && (
                        <div className="flex items-start gap-2 mb-3">
                          <User className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <div className="flex flex-wrap gap-1 min-w-0 flex-1">
                            {fotografo.especialidades.map(esp => {
                              const tipoLabel = TIPOS_EVENTO.find(t => t.value === esp)?.label || esp;
                              return (
                                <Badge 
                                  key={esp} 
                                  className={`text-xs ${getEventTypeColor(esp)}`}
                                >
                                  {tipoLabel}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {fotografoEventos.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-medium mb-2">Eventos próximos:</h4>
                          <div className="flex flex-wrap gap-2">
                            {eventosFuturos.slice(0, 3).map((evento) => (
                              <Badge key={evento.id} variant="secondary" className="text-xs break-words">
                                {evento.cliente} - {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </Badge>
                            ))}
                          </div>
                          {eventosFuturos.length === 0 && (
                            <p className="text-xs text-muted-foreground">Nenhum evento futuro</p>
                          )}
                        </div>
                      )}
                      
                      {fotografoEventos.length === 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground">Nenhum evento atribuído</p>
                        </div>
                      )}
                    </div>

                    {canEditFotografos && (
                    <div className="flex items-center gap-0 w-auto" style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', paddingLeft: '10px', width: '60px', marginTop: '-8px'}}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            aria-label="Excluir fotógrafo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o fotógrafo <strong>{fotografo.nome}</strong>?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(fotografo.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(fotografo)}
                        aria-label="Editar fotógrafo"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card className="shadow-soft min-h-[200px] flex flex-col">
              <CardContent className="text-center py-12 flex-1 flex flex-col justify-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum fotógrafo encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Tente ajustar o termo de busca'
                    : 'Comece criando seu primeiro fotógrafo'
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

export default Fotografos;