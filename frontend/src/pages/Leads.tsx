import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/hooks/useClientes';
import { Mail, Phone, UserPlus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Leads: React.FC = () => {
  const { leads, loading, refetch } = useLeads();
  const { toast } = useToast();

  const handleConvert = async (id: string, nome: string) => {
    try {
      await apiRequest(`/clientes/${id}/convert`, { method: 'POST' });
      toast({ title: 'Convertido com sucesso', description: `${nome} agora é um cliente.` });
      refetch();
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Não foi possível converter o lead.', variant: 'destructive' });
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Leads capturados via site público</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {leads.length > 0 ? leads.map((lead) => (
          <Card key={lead.id} className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span className="truncate">{lead.nome}</span>
                <Badge variant="secondary">Lead</Badge>
              </CardTitle>
              <CardDescription className="truncate">{lead.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{lead.email}</span>
                </div>
                {lead.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{lead.telefone}</span>
                  </div>
                )}
                {lead.origem && (
                  <div className="flex items-center gap-2 text-xs">
                    <span>Origem:</span>
                    <Badge variant="outline">{lead.origem}</Badge>
                  </div>
                )}
                {lead.mensagem && (
                  <p className="text-xs leading-relaxed bg-muted p-2 rounded">{lead.mensagem}</p>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Converter para cliente
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Converter lead em cliente</AlertDialogTitle>
                    <AlertDialogDescription>
                      O lead <strong>{lead.nome}</strong> será cadastrado como cliente e passará a aparecer na página de clientes. Deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleConvert(lead.id, lead.nome)}>Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full">
            <Card className="shadow-soft">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum lead encontrado</h3>
                <p className="text-muted-foreground">Leads enviados pelo site aparecerão aqui.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads; 