import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event, TIPOS_EVENTO } from '@/types';
import { Calendar, Users, UserCheck, Plus, Clock, MapPin, Coins, User, Download, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getEventTypeColor } from '@/utils/eventColors';
import { useNavigate } from 'react-router-dom';
import { useEventos } from '@/hooks/useEventos';
import { useClientes } from '@/hooks/useClientes';
import { useCombinedFotografos } from '@/hooks/useCombinedFotografos';
import { useDashboard } from '@/hooks/useDashboard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);
  const { eventos } = useEventos();
  const { clientes } = useClientes();
  const { fotografos } = useCombinedFotografos();
  const { data: dashboardData, loading: dashboardLoading } = useDashboard();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getEventColor = (tipoEvento: string) => {
    const colorMap = {
      'estudio': '#3b82f6',
      'evento': '#8b5cf6', 
      'aniversario': '#ec4899',
      'mesversario': '#f97316',
      'gestante': '#10b981',
      'formatura': '#6366f1',
      'debutante': '#f43f5e',
      'casamento': '#f59e0b'
    };
    return colorMap[tipoEvento as keyof typeof colorMap] || '#6b7280';
  };

  const calendarEvents = eventos.map(evento => ({
    id: evento.id,
    title: `${evento.cliente} - ${TIPOS_EVENTO.find(t => t.value === evento.tipoEvento)?.label}`,
    date: evento.data,
    backgroundColor: getEventColor(evento.tipoEvento),
    borderColor: getEventColor(evento.tipoEvento),
    textColor: '#ffffff',
  }));

  const handleDateClick = (arg: any) => {
    const today = new Date().toISOString().split('T')[0];
    if (arg.dateStr !== today) {
      setSelectedDate(arg.dateStr);
    }
  };

  const eventosDoHoje = dashboardData?.eventosHoje || [];
  const eventosDataSelecionada = selectedDate 
    ? eventos.filter(evento => evento.data === selectedDate).sort((a, b) => a.inicio.localeCompare(b.inicio))
    : [];

  const totalReceita = dashboardData?.totalReceita || 0;

  const exportToExcel = () => {
    const exportData = eventos.map(evento => ({
      'ID': evento.id,
      'Cliente': evento.cliente,
      'Email': evento.email,
      'Telefone': evento.telefone,
      'Tipo de Evento': TIPOS_EVENTO.find(t => t.value === evento.tipoEvento)?.label || evento.tipoEvento,
      'Data': new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR'),
      'Horário Início': evento.inicio,
      'Horário Término': evento.termino,
      'Local': evento.local,
      'Cidade': evento.cidade,
      'Descrição': evento.descricao,
      'Preço': `R$ ${evento.preco.toFixed(2)}`,
      'Fotógrafos': evento.fotografos.join(', '),
      'Status': evento.status === 'concluido' ? 'Concluído' : 'Pendente',
      'Link do Drive': evento.driveLink || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Eventos');
    const wscols = [
      {wch: 10}, {wch: 20}, {wch: 25}, {wch: 15}, {wch: 15}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 30}, {wch: 15}, {wch: 40}, {wch: 12}, {wch: 25}, {wch: 12}, {wch: 30}
    ];
    (ws as any)['!cols'] = wscols;
    const fileName = `eventos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={exportToExcel} variant="outline" className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={() => navigate('/app/eventos?new=1')} className="shadow-elegant flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {dashboardLoading ? '...' : dashboardData?.totalEventos || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Clientes</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {dashboardLoading ? '...' : dashboardData?.totalClientes || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Fotógrafos</CardTitle>
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-primary">{fotografos.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Receita Total</CardTitle>
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {dashboardLoading ? '...' : totalReceita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendário */}
        <Card className="xl:col-span-2 shadow-soft h-fit">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Calendário de Eventos</CardTitle>
            <CardDescription className="text-sm">
              Clique em uma data para ver os eventos agendados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              dateClick={handleDateClick}
              height="auto"
              aspectRatio={1.35}
              locale="pt-br"
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: 'today'
              }}
              buttonText={{
                today: 'Hoje'
              }}
              moreLinkText={(num) => `+${num} mais`}
              dayMaxEvents={2}
              moreLinkClick="popover"
              eventClassNames="cursor-pointer text-xs"
              dayCellClassNames={(date) => {
                const dateStr = date.date.toISOString().split('T')[0];
                const isSelected = selectedDate === dateStr;
                return `hover:cursor-pointer ${isSelected ? 'fc-day-selected' : ''}`;
              }}
              dayHeaderClassNames="text-xs"
            />
          </CardContent>
        </Card>

        {/* Eventos do Dia */}
        <div className="space-y-4">
          <Card className={`shadow-soft ${eventosDoHoje.length === 0 ? 'h-auto' : 'h-auto xl:h-[400px]'} flex flex-col`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Eventos de Hoje</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {dashboardLoading ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <p className="text-muted-foreground text-sm">Carregando...</p>
                </div>
              ) : eventosDoHoje.length > 0 ? (
                <div className={`space-y-3 ${eventosDoHoje.length > 1 ? 'max-h-96 overflow-y-auto' : ''}`}>
                  {eventosDoHoje.map((evento) => {
                    return (
                      <div key={evento.id} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{evento.cliente}</h4>
                          <Badge className={`text-xs ${evento.status === 'pendente' ? 'bg-yellow-400 text-black' : evento.status === 'cancelado' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                            {evento.status === 'pendente' ? 'Pendente' : evento.status === 'cancelado' ? 'Cancelado' : 'Concluído'}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <Badge className={`mb-2 ${getEventTypeColor(evento.tipoEvento)}`}>
                            {TIPOS_EVENTO.find(t => t.value === evento.tipoEvento)?.label}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {evento.inicio} - {evento.termino}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span className="text-muted-foreground">{evento.cidade}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {evento.local.startsWith('http://') || evento.local.startsWith('https://') ? (
                              <a 
                                href={evento.local} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                                title={evento.local}
                              >
                                Ver local
                              </a>
                            ) : (
                              evento.local
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4" />
                            {evento.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                        
                        {evento.fotografos && evento.fotografos.length > 0 && (
                          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded text-xs">
                            <User className="h-3 w-3 text-primary" />
                            <span className="text-primary truncate">{evento.fotografos[0]}</span>
                            {evento.fotografos.length > 1 && (
                              <span className="text-muted-foreground">+{evento.fotografos.length - 1}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">
                    Nenhum evento hoje
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedDate && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">
                  Eventos - {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventosDataSelecionada.length > 0 ? (
                  <div className={`space-y-3 ${eventosDataSelecionada.length > 1 ? 'max-h-96 overflow-y-auto' : ''}`}>
                    {eventosDataSelecionada.map((evento) => (
                      <div key={evento.id} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{evento.cliente}</h4>
                          <Badge className={`text-xs ${evento.status === 'pendente' ? 'bg-yellow-400 text-black' : evento.status === 'cancelado' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                            {evento.status === 'pendente' ? 'Pendente' : evento.status === 'cancelado' ? 'Cancelado' : 'Concluído'}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <Badge className={`mb-2 ${getEventTypeColor(evento.tipoEvento)}`}>
                            {TIPOS_EVENTO.find(t => t.value === evento.tipoEvento)?.label}
                          </Badge>
                          
                          {evento.descricao && (
                            <p className="text-sm text-muted-foreground mt-2">{evento.descricao}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {evento.inicio} - {evento.termino}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span className="text-muted-foreground">{evento.cidade}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {evento.local.startsWith('http://') || evento.local.startsWith('https://') ? (
                              <a 
                                href={evento.local} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                                title={evento.local}
                              >
                                Ver local
                              </a>
                            ) : (
                              evento.local
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4" />
                            {evento.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                        
                        {evento.fotografos && evento.fotografos.length > 0 && (
                          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <User className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              {evento.fotografos.length === 1 ? 'Fotógrafo:' : 'Fotógrafos:'} 
                              <span className="text-primary ml-1">{evento.fotografos.join(', ')}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum evento nesta data
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;