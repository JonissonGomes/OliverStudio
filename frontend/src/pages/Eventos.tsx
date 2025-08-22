import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useEventos } from '@/hooks/useEventos';
import { useClientes } from '@/hooks/useClientes';
import { useCombinedFotografos } from '@/hooks/useCombinedFotografos';
import { InputMask } from '@/components/ui/input-mask';
import { Event, TIPOS_EVENTO } from '@/types';
import { Plus, Edit, Trash2, Search, Calendar, Clock, MapPin, Coins, User, ListCollapse, ListIcon, Building2, X } from 'lucide-react';
import { getEventTypeColor } from '@/utils/eventColors';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { EventRecurrenceForm } from '@/components/EventRecurrenceForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect } from 'react';

const Eventos: React.FC = () => {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [expandedFotografos, setExpandedFotografos] = useState<Record<string, boolean>>({});
  const [groupRecurrences, setGroupRecurrences] = useState<boolean>(true);
  const [openOccurrencesKey, setOpenOccurrencesKey] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [seriesDialogOpen, setSeriesDialogOpen] = useState<boolean>(false);
  const [pendingBaseEvent, setPendingBaseEvent] = useState<Omit<Event, 'id'> | null>(null);
  const [pendingEditDate, setPendingEditDate] = useState<string>('');
  const [canEditClientModal, setCanEditClientModal] = useState<boolean>(false);
  const [loadingSomenteEsta, setLoadingSomenteEsta] = useState<boolean>(false);
  const [loadingEstaEFuturas, setLoadingEstaEFuturas] = useState<boolean>(false);
  const { toast } = useToast();
  const { eventos, addEvento, updateEvento, deleteEvento } = useEventos();
  const { clientes } = useClientes();
  const { fotografos } = useCombinedFotografos();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFotografo, setFilterFotografo] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pendente');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const MAX_DESCRIPTION_LENGTH = 45;
  
  const toggleDescription = (eventoId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [eventoId]: !prev[eventoId]
    }));
  };

  const toggleFotografos = (eventoId: string) => {
    setExpandedFotografos(prev => ({
      ...prev,
      [eventoId]: !prev[eventoId]
    }));
  };

  const [formData, setFormData] = useState<Partial<Event>>({
    clienteId: undefined,
    cliente: '',
    email: '',
    telefone: '',
    tipoEvento: 'estudio',
    data: '',
    inicio: '',
    termino: '',
    local: '',
    cidade: '',
    descricao: '',
    preco: 0,
    fotografos: [],
    driveLink: '',
    status: 'pendente',
  });
  const [precoDisplay, setPrecoDisplay] = useState<string>('');
  const [clientQuery, setClientQuery] = useState<string>('');
  const [clientPopoverOpen, setClientPopoverOpen] = useState<boolean>(false);
  const clientInputRef = React.useRef<HTMLInputElement>(null);
  const clientEditInputRef = React.useRef<HTMLInputElement>(null);

  const filteredClients = React.useMemo(() => {
    const q = (clientQuery || '').toLowerCase();
    return clientes.filter(c => c.nome.toLowerCase().includes(q)).slice(0, 10);
  }, [clientQuery, clientes]);

  const selectClient = (c: { id: string; nome: string; email: string; telefone: string }) => {
    setFormData({
      ...formData,
      clienteId: c.id,
      cliente: c.nome,
      email: c.email,
      telefone: c.telefone,
    });
    setClientQuery(c.nome);
    setClientPopoverOpen(false);
  };

  const tryAutoSelectOnBlur = () => {
    if (formData.clienteId) return;
    const exact = clientes.find(c => c.nome.toLowerCase() === (clientQuery || '').toLowerCase());
    if (exact) selectClient(exact as any);
  };

  React.useEffect(() => {
    // inicializa máscara com base no valor
    const valor = Number(formData.preco || 0);
    setPrecoDisplay(valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
    setClientQuery(formData.cliente || '');
  }, []);

  // Atualiza máscara de preço quando o valor numérico mudar (inclusive ao entrar no modo edição)
  React.useEffect(() => {
    const valor = Number(formData.preco || 0);
    setPrecoDisplay(valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
  }, [formData.preco]);

  // Ao abrir o modal de edição, garante que clientQuery reflita o cliente atual
  React.useEffect(() => {
    if (isEditOpen) {
      setClientQuery(formData.cliente || '');
      setClientPopoverOpen(false);
      // foca automaticamente o input de cliente no modal
      setTimeout(() => {
        clientEditInputRef.current?.focus();
      }, 0);
    }
  }, [isEditOpen]);

  const handlePrecoChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const cents = Number(digits) / 100;
    setPrecoDisplay(digits ? cents.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '');
    setFormData({ ...formData, preco: isNaN(cents) ? 0 : cents });
  };

  // Helpers para limitar comprimento de campos de data/hora
  const onChangeDate = (value: string) => value.slice(0, 10);
  const onChangeTime = (value: string) => value.slice(0, 5);

  const resetForm = () => {
    setFormData({
      clienteId: undefined,
      cliente: '',
      email: '',
      telefone: '',
      tipoEvento: 'estudio',
      data: '',
      inicio: '',
      termino: '',
      local: '',
      cidade: '',
      descricao: '',
      preco: 0,
      fotografos: [],
      driveLink: '',
      status: 'pendente',
    });
    setEditingEvent(null);
    setExpandedFotografos({});
    setExpandedDescriptions({});
    setIsFormOpen(false);
    setIsEditOpen(false);
    setCanEditClientModal(false);
  };

  const validateEventConflict = (novoEvento: Partial<Event>, editingId?: string) => {
    const eventosDoCliente = eventos.filter(evento => 
      evento.email === novoEvento.email && evento.id !== editingId
    );

    const novaData = novoEvento.data;
    const novoInicio = novoEvento.inicio;
    const novoTermino = novoEvento.termino;

    for (const evento of eventosDoCliente) {
      if (evento.data === novaData) {
        if (novoInicio && evento.inicio) {
          const novoInicioTime = new Date(`2000-01-01T${novoInicio}`);
          const eventoInicioTime = new Date(`2000-01-01T${evento.inicio}`);
          const eventoTerminoTime = evento.termino ? new Date(`2000-01-01T${evento.termino}`) : null;
          const novoTerminoTime = novoTermino ? new Date(`2000-01-01T${novoTermino}`) : null;

          if (eventoTerminoTime && novoTerminoTime) {
            if (
              (novoInicioTime >= eventoInicioTime && novoInicioTime < eventoTerminoTime) ||
              (novoTerminoTime > eventoInicioTime && novoTerminoTime <= eventoTerminoTime) ||
              (novoInicioTime <= eventoInicioTime && novoTerminoTime >= eventoTerminoTime)
            ) {
              return evento;
            }
          } else {
            if (novoInicioTime.getTime() === eventoInicioTime.getTime()) {
              return evento;
            }
          }
        }
      }
    }
    return null;
  };

  const createRecurrentEvents = (baseEvent: Omit<Event, 'id'>) => {
    if (!baseEvent.recorrencia) return [baseEvent];

    const events: Omit<Event, 'id'>[] = [baseEvent];
    const { tipo, frequencia, dataFim, totalOcorrencias } = baseEvent.recorrencia;
    
    let currentDate = new Date(baseEvent.data + 'T00:00:00');
    let eventCount = 1;
    const maxEvents = totalOcorrencias || 50;
    const endDate = dataFim ? new Date(dataFim + 'T00:00:00') : null;

    while (eventCount < maxEvents) {
      switch (tipo) {
        case 'diaria':
          currentDate.setDate(currentDate.getDate() + frequencia);
          break;
        case 'semanal':
          currentDate.setDate(currentDate.getDate() + (frequencia * 7));
          break;
        case 'mensal':
          currentDate.setMonth(currentDate.getMonth() + frequencia);
          break;
        case 'anual':
          currentDate.setFullYear(currentDate.getFullYear() + frequencia);
          break;
      }

      if (endDate && currentDate > endDate) break;

      const newEventData: Omit<Event, 'id'> = {
        ...baseEvent,
        data: currentDate.toISOString().split('T')[0],
        recorrencia: undefined,
      };

      const conflito = validateEventConflict(newEventData);
      if (!conflito) {
        events.push(newEventData);
      }

      eventCount++;
    }

    return events;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação mais detalhada dos campos obrigatórios
    if (!formData.clienteId) {
      toast({
        title: "Erro",
        description: "Cliente não selecionado. Por favor, selecione um cliente válido.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.data || !formData.inicio) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios: E-mail, Data e Horário de Início",
        variant: "destructive",
      });
      return;
    }

    // Detecta se vamos regenerar série: edição + detecta série por chave
    const computeSeriesKey = (ev: Partial<Event>) => `${ev.clienteId || ev.email}|${ev.tipoEvento}|${ev.inicio}|${ev.termino}|${ev.local}`;
    const isEditing = Boolean(editingEvent?.id);
    const oldSeriesKey = isEditing ? computeSeriesKey(editingEvent as Event) : null;
    const seriesItems = isEditing && oldSeriesKey
      ? eventos.filter((ev) => computeSeriesKey(ev) === oldSeriesKey)
      : [];
    const shouldRegenerateSeries = Boolean(isEditing && seriesItems.length > 1);

    // Conflito apenas no fluxo normal (quando não regenerar série)
    if (!shouldRegenerateSeries) {
    const conflito = validateEventConflict(formData, editingEvent?.id);
    if (conflito) {
      toast({
        title: "Conflito de horário",
        description: `Já existe um evento para este cliente na mesma data/horário: ${TIPOS_EVENTO.find(t => t.value === conflito.tipoEvento)?.label} em ${new Date(conflito.data + 'T00:00:00').toLocaleDateString('pt-BR')} às ${conflito.inicio}`,
        variant: "destructive",
      });
      return;
      }
    }

    const baseEvent: Omit<Event, 'id'> = {
      clienteId: formData.clienteId,
      cliente: formData.cliente || (clientes.find(c => c.id === formData.clienteId)?.nome || ''),
      email: formData.email!,
      telefone: formData.telefone || '',
      tipoEvento: formData.tipoEvento!,
      data: formData.data!,
      inicio: formData.inicio!,
      termino: formData.termino || '',
      local: formData.local || '',
      cidade: formData.cidade || '',
      descricao: formData.descricao || '',
      preco: formData.preco || 0,
      fotografos: formData.fotografos || [],
      driveLink: formData.driveLink,
      status: (formData.status as any) || editingEvent?.status || 'pendente',
      recorrencia: formData.recorrencia,
    };

    try {
      if (shouldRegenerateSeries) {
        // Abrir diálogo de confirmação de alcance
        setPendingBaseEvent(baseEvent);
        setPendingEditDate(baseEvent.data);
        setSeriesDialogOpen(true);
      } else if (editingEvent) {
        await updateEvento(editingEvent.id, baseEvent);
        toast({ title: "Evento atualizado", description: "O evento foi atualizado com sucesso" });
      } else {
        const eventosParaCriar = createRecurrentEvents(baseEvent);
        await Promise.all(eventosParaCriar.map((ev) => addEvento(ev)));
        toast({ title: "Sucesso", description: eventosParaCriar.length > 1 ? `${eventosParaCriar.length} eventos criados com sucesso (incluindo recorrências)` : "Evento criado com sucesso" });
      }

      if (!shouldRegenerateSeries) resetForm();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar o evento", variant: "destructive" });
    }
  };

  const handleEdit = (evento: Event) => {
    // Verificar se o evento tem ID válido
    if (!evento.id) {
      toast({
        title: "Erro",
        description: "Evento inválido. ID não encontrado.",
        variant: "destructive"
      });
      return;
    }
    
    // Limpar fotógrafos removidos do sistema antes de editar
    const fotografosLimpos = limparFotografosRemovidos(evento);
    
    // Buscar o cliente correspondente - converter IDs para string para comparação
    const matched = clientes.find(c => String(c.id) === evento.clienteId) || 
                    clientes.find(c => c.nome === evento.cliente);
    
    // Garantir que o clienteId seja definido corretamente
    const clienteId = matched ? String(matched.id) : evento.clienteId;
    
    if (!clienteId) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado. Verifique se o cliente ainda existe no sistema.",
        variant: "destructive"
      });
      return;
    }
    
    setFormData({ 
      ...evento, 
      clienteId: clienteId, 
      cliente: matched?.nome || evento.cliente,
      cidade: evento.cidade || '',
      fotografos: fotografosLimpos // Usar fotógrafos limpos
    });
    setClientQuery(matched?.nome || evento.cliente || '');
    setPrecoDisplay((evento.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    setEditingEvent(evento);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvento(id);
      toast({ title: "Evento excluído", description: "O evento foi excluído com sucesso" });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o evento", variant: "destructive" });
    }
  };

  const handleClienteChange = (_nome: string) => {
    return;
  };

  const handleFotografoToggle = (fotografoNome: string) => {
    const fotografosAtuais = formData.fotografos || [];
    const jaEstaIncluido = fotografosAtuais.includes(fotografoNome);
    
    if (jaEstaIncluido) {
      setFormData({
        ...formData,
        fotografos: fotografosAtuais.filter(f => f !== fotografoNome)
      });
    } else {
      setFormData({
        ...formData,
        fotografos: [...fotografosAtuais, fotografoNome]
      });
    }
  };

  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = evento.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.local.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || evento.tipoEvento === filterType;
    const matchesFotografo = filterFotografo === 'all' || evento.fotografos?.includes(filterFotografo);
    const matchesStatus = statusFilter === 'all' ? true : evento.status === statusFilter;
    const matchesStart = startDate ? evento.data >= startDate : true;
    const matchesEnd = endDate ? evento.data <= endDate : true;
    return matchesSearch && matchesType && matchesFotografo && matchesStatus && matchesStart && matchesEnd;
  });

  // Agrupamento de recorrências (heurístico por chave estável)
  const groups = React.useMemo(() => {
    if (!groupRecurrences) return [] as Array<any>;
    const map: Record<string, Event[]> = {};
    for (const ev of filteredEventos) {
      const key = `${ev.clienteId || ev.email}|${ev.tipoEvento}|${ev.inicio}|${ev.termino}|${ev.local}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    const result = Object.entries(map).map(([key, items]) => {
      const sorted = items.slice().sort((a, b) => a.data.localeCompare(b.data));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      return {
        key,
        items: sorted,
        sample: first,
        count: sorted.length,
        firstDate: first.data,
        lastDate: last.data,
      };
    }).sort((a, b) => a.firstDate.localeCompare(b.firstDate));
    return result;
  }, [filteredEventos, groupRecurrences]);

  const formatDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
  const todayIso = React.useMemo(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }, []);

  const monthlyBuckets = (items: Event[]) => {
    const map: Record<string, Event[]> = {};
    for (const it of items) {
      const d = new Date(it.data + 'T00:00:00');
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(it);
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, evs]) => ({ key, label: new Date(key + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), items: evs.sort((a,b) => a.data.localeCompare(b.data)) }));
  };

  const location = useLocation();
  const navigate = useNavigate();

  // Focar input de cliente ao abrir formulário de criação
  React.useEffect(() => {
    if (isFormOpen) {
      setTimeout(() => {
        clientInputRef.current?.focus();
      }, 0);
    }
  }, [isFormOpen]);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') {
      setIsFormOpen(true);
    }
    const editId = params.get('edit');
    if (editId) {
      const ev = eventos.find((e) => e.id === editId);
      if (ev) {
        const matched = clientes.find(c => String(c.id) === ev.clienteId) || clientes.find(c => c.nome === ev.cliente);
        setFormData({ 
          ...ev, 
          clienteId: matched?.id, 
          cliente: matched?.nome || ev.cliente,
          cidade: ev.cidade || ''
        });
        setClientQuery(matched?.nome || ev.cliente || '');
        setPrecoDisplay((ev.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        setEditingEvent(ev);
        setIsEditOpen(true);
      }
    }
    // Restaurar filtros a partir da URL primeiro; se ausentes, tentar localStorage
    const urlQ = params.get('q');
    const urlType = params.get('type');
    const urlPhotog = params.get('photog');
    const urlStatus = params.get('status');
    const urlStart = params.get('start');
    const urlEnd = params.get('end');
    const urlGroup = params.get('group');
    const hadAny = [urlQ, urlType, urlPhotog, urlStatus, urlStart, urlEnd, urlGroup].some(v => v !== null);
    if (hadAny) {
      if (urlQ !== null) setSearchTerm(urlQ);
      if (urlType !== null) setFilterType(urlType || 'all');
      if (urlPhotog !== null) setFilterFotografo(urlPhotog || 'all');
      if (urlStatus !== null) setStatusFilter(urlStatus || 'all');
      if (urlStart !== null) setStartDate(urlStart || '');
      if (urlEnd !== null) setEndDate(urlEnd || '');
      if (urlGroup !== null) setGroupRecurrences(urlGroup !== '0');
    } else {
      try {
        const saved = localStorage.getItem('eventFilters');
        if (saved) {
          const f = JSON.parse(saved);
          if (typeof f.q === 'string') setSearchTerm(f.q);
          if (typeof f.type === 'string') setFilterType(f.type);
          if (typeof f.photog === 'string') setFilterFotografo(f.photog);
          if (typeof f.status === 'string') setStatusFilter(f.status);
          if (typeof f.start === 'string') setStartDate(f.start);
          if (typeof f.end === 'string') setEndDate(f.end);
          if (typeof f.group === 'boolean') setGroupRecurrences(f.group);
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Sincroniza filtros com URL e localStorage
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prev = params.toString();
    // Preservar deep-links new/edit
    if (searchTerm) params.set('q', searchTerm); else params.delete('q');
    if (filterType && filterType !== 'all') params.set('type', filterType); else params.delete('type');
    if (filterFotografo && filterFotografo !== 'all') params.set('photog', filterFotografo); else params.delete('photog');
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter); else params.delete('status');
    if (startDate) params.set('start', startDate); else params.delete('start');
    if (endDate) params.set('end', endDate); else params.delete('end');
    params.set('group', groupRecurrences ? '1' : '0');
    const next = params.toString();
    if (next !== prev) {
      navigate({ pathname: '/app/eventos', search: `?${next}` }, { replace: true });
    }
    try {
      localStorage.setItem('eventFilters', JSON.stringify({
        q: searchTerm,
        type: filterType,
        photog: filterFotografo,
        status: statusFilter,
        start: startDate,
        end: endDate,
        group: groupRecurrences,
      }));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterType, filterFotografo, statusFilter, startDate, endDate, groupRecurrences]);

  // Função para limpar fotógrafos removidos do sistema
  const limparFotografosRemovidos = (evento: Event) => {
    // Verificar se o evento tem ID válido
    if (!evento.id) {
      console.warn('Evento sem ID válido:', evento);
      return evento.fotografos || [];
    }
    
    const fotografosValidos = fotografos.map(f => f.nome);
    const fotografosLimpos = evento.fotografos?.filter(f => fotografosValidos.includes(f)) || [];
    
    // Se houve mudança, atualizar o evento
    if (fotografosLimpos.length !== evento.fotografos?.length) {
      updateEvento(evento.id, { ...evento, fotografos: fotografosLimpos });
      toast({ 
        title: 'Fotógrafos atualizados', 
        description: 'Fotógrafos removidos do sistema foram automaticamente removidos do evento.' 
      });
    }
    
    return fotografosLimpos;
  };

  // Aplicar limpeza automática ao carregar eventos
  useEffect(() => {
    if (eventos.length > 0 && fotografos.length > 0) {
      eventos.forEach(evento => {
        // Verificar se o evento tem ID válido antes de processar
        if (!evento.id) {
          console.warn('Evento sem ID válido encontrado:', evento);
          return;
        }
        
        const fotografosValidos = fotografos.map(f => f.nome);
        const temFotografoInvalido = evento.fotografos?.some(f => !fotografosValidos.includes(f));
        
        if (temFotografoInvalido) {
          limparFotografosRemovidos(evento);
        }
      });
    }
  }, [eventos, fotografos]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Eventos</h1>
        <div className="flex items-center gap-2">
        <Button onClick={() => setIsFormOpen(true)} className="shadow-elegant w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>
              </div>

      
      {/* Formulário de criação inline */}
      {isFormOpen && (
        <Card className="shadow-soft animate-slide-up">
          <CardHeader>
            <CardTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</CardTitle>
            <CardDescription>
              Preencha as informações do evento fotográfico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="clienteId">Cliente *</Label>
                  <Popover open={clientPopoverOpen} onOpenChange={(o) => setClientPopoverOpen(o && Boolean(clientQuery.trim().length))}>
                    <PopoverAnchor asChild>
                  <Input
                        id="clienteId"
                        ref={clientInputRef}
                        value={clientQuery}
                        onChange={(e) => {
                          const v = e.target.value;
                          setClientQuery(v);
                          setClientPopoverOpen(Boolean(v.trim().length));
                        }}
                        onBlur={tryAutoSelectOnBlur}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredClients.length > 0) selectClient(filteredClients[0] as any);
                          }
                        }}
                        placeholder="Digite para pesquisar..."
                      />
                    </PopoverAnchor>
                    <PopoverContent className="p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                      <Command shouldFilter={false}>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {filteredClients.map((c) => (
                                <CommandItem
                                  key={c.id}
                                  value={c.nome}
                                  onSelect={() => {
                                    selectClient(c as any);
                                  }}
                                >
                                  {c.nome}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <Label htmlFor="tipoEvento">Tipo de Evento *</Label>
                  <Select 
                    value={formData.tipoEvento} 
                    onValueChange={(value) => setFormData({ ...formData, tipoEvento: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_EVENTO.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: onChangeDate(e.target.value) })}
                    maxLength={10}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="inicio">Horário de Início *</Label>
                  <Input
                    id="inicio"
                    type="time"
                    value={formData.inicio}
                    onChange={(e) => setFormData({ ...formData, inicio: onChangeTime(e.target.value) })}
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="termino">Horário de Término</Label>
                  <Input
                    id="termino"
                    type="time"
                    value={formData.termino}
                    onChange={(e) => setFormData({ ...formData, termino: onChangeTime(e.target.value) })}
                    maxLength={5}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    placeholder="Ex: Estúdio Central"
                    maxLength={120}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Ex: São Paulo"
                    maxLength={60}
                  />
                </div>
                <div className="md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Detalhes do evento, observações especiais..."
                    maxLength={500}
                />
              </div>
              <div>
                  <Label htmlFor="preco">Preço</Label>
                  <Input
                    id="preco"
                    type="text"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={precoDisplay}
                    onChange={(e) => handlePrecoChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                        <Checkbox
                      id="status"
                      checked={formData.status === 'concluido'}
                      onCheckedChange={(v) => setFormData({ ...formData, status: v ? 'concluido' as any : 'pendente' as any })}
                    />
                    <span className="text-sm text-muted-foreground">Concluído</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Fotógrafos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {fotografos.map((f) => (
                      <Badge key={f.id} variant={formData.fotografos?.includes(f.nome) ? 'default' : 'outline'} className="cursor-pointer text-xs px-2 py-0.5" onClick={() => handleFotografoToggle(f.nome)}>
                        {f.nome}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Ocorrência</Label>
                  <EventRecurrenceForm formData={formData} setFormData={setFormData} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button type="submit">{editingEvent ? 'Salvar' : 'Criar'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filtros (movidos para abaixo do formulário) */}
      <Card className="shadow-soft">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-end">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {TIPOS_EVENTO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterFotografo} onValueChange={setFilterFotografo}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por fotógrafo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fotógrafos</SelectItem>
                  {fotografos.map((fotografo) => (
                    <SelectItem key={fotografo.id} value={fotografo.nome}>
                      {fotografo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="concluido">Concluídos</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 w-full sm:w-auto">
                <div>
                  <Label className="text-xs">De</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-40 h-10" />
                </div>
                <div>
                  <Label className="text-xs">Até</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-40 h-10" />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:self-end h-10">
                <Checkbox id="groupRec" checked={groupRecurrences} onCheckedChange={(v) => setGroupRecurrences(Boolean(v))} />
                <Label htmlFor="groupRec" className="cursor-pointer select-none flex items-center gap-1 text-sm">
                  <ListCollapse className="h-4 w-4" /> Agrupar recorrências
                        </Label>
                      </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de edição */}
      <Dialog open={isEditOpen} onOpenChange={(o) => { setIsEditOpen(o); if (!o) { navigate('/app/eventos', { replace: true }); resetForm(); } }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>Atualize as informações do evento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Reutiliza os mesmos campos do formulário inline */}
              <div>
                <Label htmlFor="clienteId_edit">Cliente *</Label>
                <Popover open={clientPopoverOpen} onOpenChange={(o) => setClientPopoverOpen(o && Boolean(clientQuery.trim().length))}>
                  <PopoverAnchor asChild>
                    <Input
                      id="clienteId_edit"
                      ref={clientEditInputRef}
                      value={clientQuery}
                      onChange={(e) => {
                        const v = e.target.value;
                        setClientQuery(v);
                        setClientPopoverOpen(Boolean(v.trim().length));
                      }}
                      onBlur={tryAutoSelectOnBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredClients.length > 0) selectClient(filteredClients[0] as any);
                        }
                      }}
                      placeholder="Digite para pesquisar..."
                    />
                  </PopoverAnchor>
                  <PopoverContent className="p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <Command shouldFilter={false}>
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {filteredClients.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.nome}
                              onSelect={() => selectClient(c as any)}
                            >
                              {c.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                  </div>
              <div>
                <Label htmlFor="email_edit">E-mail *</Label>
                <Input id="email_edit" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} maxLength={120} required />
              </div>
              <div>
                <Label htmlFor="telefone_edit">Telefone</Label>
                <InputMask id="telefone_edit" mask="phone" value={formData.telefone || ''} onChange={(value) => setFormData({ ...formData, telefone: value })} placeholder="(11) 9 1234-5678" maxLength={15} />
              </div>
              <div>
                <Label htmlFor="tipo_edit">Tipo de Evento *</Label>
                <Select value={formData.tipoEvento} onValueChange={(value) => setFormData({ ...formData, tipoEvento: value as any })}>
                  <SelectTrigger id="tipo_edit"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_EVENTO.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="data_edit">Data *</Label>
                <Input id="data_edit" type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: onChangeDate(e.target.value) })} maxLength={10} required />
              </div>
              <div>
                <Label htmlFor="inicio_edit">Horário de Início *</Label>
                <Input id="inicio_edit" type="time" value={formData.inicio} onChange={(e) => setFormData({ ...formData, inicio: onChangeTime(e.target.value) })} maxLength={5} required />
              </div>
              <div>
                <Label htmlFor="termino_edit">Horário de Término</Label>
                <Input id="termino_edit" type="time" value={formData.termino} onChange={(e) => setFormData({ ...formData, termino: onChangeTime(e.target.value) })} maxLength={5} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="local_edit">Local</Label>
                <Input id="local_edit" value={formData.local} onChange={(e) => setFormData({ ...formData, local: e.target.value })} placeholder="Ex: Estúdio Central" maxLength={120} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="cidade_edit">Cidade</Label>
                <Input id="cidade_edit" value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} placeholder="Ex: São Paulo" maxLength={60} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="descricao_edit">Descrição</Label>
                <Textarea id="descricao_edit" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="Detalhes do evento, observações especiais..." maxLength={500} />
              </div>
              <div>
                <Label htmlFor="preco_edit">Preço</Label>
                <Input id="preco_edit" type="text" inputMode="numeric" placeholder="R$ 0,00" value={precoDisplay} onChange={(e) => handlePrecoChange(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="status_edit">Status</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox id="status_edit" checked={formData.status === 'concluido'} onCheckedChange={(v) => setFormData({ ...formData, status: v ? 'concluido' as any : 'pendente' as any })} />
                  <span className="text-sm text-muted-foreground">Concluído</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label>Fotógrafos</Label>
                
                {/* Fotógrafos atuais do evento */}
                {formData.fotografos && formData.fotografos.length > 0 && (
                  <div className="mb-3">
                    <Label className="text-xs text-muted-foreground">Fotógrafos atuais:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.fotografos.map((fotografo, index) => (
                        <Badge 
                          key={`${fotografo}-${index}`} 
                          variant="default" 
                          className="text-xs px-2 py-1 flex items-center gap-1"
                        >
                          {fotografo}
                          <button
                            type="button"
                            onClick={() => {
                              const novosFotografos = formData.fotografos?.filter((_, i) => i !== index) || [];
                              setFormData({ ...formData, fotografos: novosFotografos });
                            }}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                            aria-label={`Remover ${fotografo}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Adicionar novos fotógrafos */}
                <Label className="text-xs text-muted-foreground">Adicionar fotógrafos:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {fotografos.map((f) => (
                    <Badge 
                      key={f.id} 
                      variant={formData.fotografos?.includes(f.nome) ? 'default' : 'outline'} 
                      className="cursor-pointer text-xs px-2 py-0.5" 
                      onClick={() => handleFotografoToggle(f.nome)}
                    >
                      {f.nome}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de alcance da atualização da série */}
      <Dialog open={seriesDialogOpen} onOpenChange={(o) => { setSeriesDialogOpen(o); if (!o) { setPendingBaseEvent(null); setPendingEditDate(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar série de eventos</DialogTitle>
            <DialogDescription>
              Este evento faz parte de uma série. Selecione o alcance da atualização.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>Nova data base: <strong>{pendingEditDate ? new Date(pendingEditDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</strong></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setSeriesDialogOpen(false)}>Cancelar</Button>
            <Button onClick={async () => {
              if (!editingEvent || !pendingBaseEvent) return;
              setLoadingSomenteEsta(true);
              await updateEvento(editingEvent.id, pendingBaseEvent);
              toast({ title: 'Evento atualizado', description: 'Apenas esta ocorrência foi atualizada.' });
              setSeriesDialogOpen(false);
              resetForm();
              setLoadingSomenteEsta(false);
            }} disabled={loadingSomenteEsta}>Somente esta</Button>
            <Button onClick={async () => {
              if (!editingEvent || !pendingBaseEvent) return;
              setLoadingEstaEFuturas(true);
              const computeSeriesKey = (ev: Partial<Event>) => `${ev.clienteId || ev.email}|${ev.tipoEvento}|${ev.inicio}|${ev.termino}|${ev.local}`;
              const key = computeSeriesKey(editingEvent);
              const items = eventos.filter((ev) => computeSeriesKey(ev) === key);
              const toDelete = items.filter((ev) => ev.status !== 'concluido' && ev.data >= (pendingEditDate || editingEvent.data));
              for (const ev of toDelete) { await deleteEvento(ev.id); }
              const novas = pendingBaseEvent.recorrencia ? createRecurrentEvents(pendingBaseEvent) : [pendingBaseEvent];
              for (const ev of novas) { await addEvento(ev); }
              toast({ title: 'Série atualizada', description: `Atualizadas ocorrência(s) a partir da nova data.` });
              setSeriesDialogOpen(false);
              resetForm();
              setLoadingEstaEFuturas(false);
            }} disabled={loadingEstaEFuturas}>Esta e futuras</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 items-start">
        {filteredEventos.length > 0 ? (
          groupRecurrences ? (
            groups.length > 0 ? (
              groups.map((g) => (
                <Card key={g.key} className="shadow-soft hover:shadow-elegant transition-shadow h-fit min-h-[240px] flex flex-col">
                  <CardContent className="pt-4 sm:pt-6 flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 flex-1">
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="text-sm sm:text-base font-semibold break-words">{g.sample.cliente}</h3>
                        </div>
                        <div className="mb-2 flex flex-col gap-1">
                          <Badge className={`text-xs px-2 py-0.5 ${getEventTypeColor(g.sample.tipoEvento)}`}>
                            {TIPOS_EVENTO.find(t => t.value === g.sample.tipoEvento)?.label}
                          </Badge>
                          <Badge className={`text-xs px-2 py-0.5 ${g.sample.status === 'pendente' ? 'bg-yellow-400 text-black' : g.sample.status === 'cancelado' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                            {g.sample.status === 'pendente' ? 'Pendente' : g.sample.status === 'cancelado' ? 'Cancelado' : 'Concluído'}
                          </Badge>
                          {g.count > 1 && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">{g.count} ocorrências</Badge>
                          )}
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(g.firstDate)}{g.count > 1 ? ` → ${formatDate(g.lastDate)}` : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{g.sample.inicio} - {g.sample.termino}</span>
                          </div>
                          {g.sample.local && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                              {g.sample.local.startsWith('http://') || g.sample.local.startsWith('https://') ? (
                                <a href={g.sample.local} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver local</a>
                              ) : (
                                <span className="break-words block">{g.sample.local}</span>
                              )}
                  </div>
                )}
                          <div className="flex items-center gap-2">
                            <Coins className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{g.sample.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>
              </div>

                        {g.sample.fotografos && g.sample.fotografos.length > 0 && (
                          <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md mb-3">
                            <User className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-medium text-foreground block">
                                {g.sample.fotografos.length === 1 ? 'Fotógrafo:' : 'Fotógrafos:'}
                              </span>
                              <div className="text-primary text-xs">
                                {g.sample.fotografos.join(', ')}
                              </div>
                            </div>
                          </div>
                        )}

                        {g.count > 1 && (() => {
                          const next = g.items.filter((it: Event) => it.data >= todayIso).slice(0, 3);
                          const fallback = g.items.slice(0, 3);
                          const shown = next.length > 0 ? next : fallback;
                          const remaining = g.items.length - shown.length;
                          return (
                            <div className="text-xs text-muted-foreground">
                              <div className="mb-1">Próximas: {shown.map((it: Event) => formatDate(it.data)).join(', ')}{remaining > 0 ? ` e +${remaining}` : ''}</div>
                              <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setOpenOccurrencesKey(g.key)}>
                                Ver todas as {g.count} datas
                              </Button>
                              <Dialog open={openOccurrencesKey === g.key} onOpenChange={(open) => setOpenOccurrencesKey(open ? g.key : null)}>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Ocorrências de {g.sample.cliente}</DialogTitle>
                                    <DialogDescription>
                                      {TIPOS_EVENTO.find(t => t.value === g.sample.tipoEvento)?.label} — {g.sample.inicio} - {g.sample.termino}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="max-h-[60vh] overflow-auto space-y-3 pr-1">
                                    {monthlyBuckets(g.items).map((bucket) => (
                                      <div key={bucket.key}>
                                        <div className="text-xs font-medium text-foreground mb-1">{bucket.label}</div>
                                        <div className="h-px bg-muted mb-2" />
                                        <div className="space-y-1">
                                          {bucket.items.map((it) => (
                                            <div key={it.id} className="py-2 border-b last:border-0">
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(it.data)}</span>
                                              </div>
                                              <div className="text-xs font-medium text-foreground mt-1">
                                                {(TIPOS_EVENTO.find(t => t.value === it.tipoEvento)?.label) || it.tipoEvento} — {it.cliente}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center gap-0 w-auto">
                        {g.items.length === 1 ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" aria-label="Excluir evento">
                                <Trash2 className="h-4 w-4" />
                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o evento de <strong>{g.sample.cliente}</strong>?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(g.items[0].id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" aria-label="Excluir ocorrências">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir ocorrências</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Deseja excluir apenas a próxima ocorrência ({formatDate(g.items[0].data)}) ou todas as {g.count} datas deste grupo?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex gap-2">
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(g.items[0].id)}>
                                  Excluir próxima
                                </AlertDialogAction>
                                <AlertDialogAction onClick={async () => {
                                  for (const it of g.items) {
                                    await handleDelete(it.id);
                                  }
                                }}>
                                  Excluir todas
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(g.items[0])}
                          aria-label="Editar evento"
                        >
                          <Edit className="h-4 w-4" />
                </Button>
              </div>
                    </div>
          </CardContent>
        </Card>
              ))
            ) : (
              <Card className="shadow-soft"><CardContent className="text-center py-12">Nenhum evento encontrado</CardContent></Card>
            )
          ) : (
          filteredEventos.map((evento) => (
            <Card key={evento.id} className="shadow-soft hover:shadow-elegant transition-shadow h-fit min-h-[280px] flex flex-col">
              <CardContent className="pt-4 sm:pt-6 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 flex-1">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start gap-2 mb-3">
                      <h3 className="text-sm sm:text-base font-semibold break-words">{evento.cliente}</h3>
                    </div>
                    
                       <div className="mb-3 flex flex-col gap-1">
                         <Badge className={`text-xs px-2 py-0.5 ${getEventTypeColor(evento.tipoEvento)}`}>
                         {TIPOS_EVENTO.find(t => t.value === evento.tipoEvento)?.label}
                       </Badge>
                         <Badge className={`text-xs px-2 py-0.5 ${evento.status === 'pendente' ? 'bg-yellow-400 text-black' : evento.status === 'cancelado' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                           {evento.status === 'pendente' ? 'Pendente' : evento.status === 'cancelado' ? 'Cancelado' : 'Concluído'}
                       </Badge>
                     </div>
                    
                    <div className="space-y-2 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{evento.inicio} - {evento.termino}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          {evento.local.startsWith('http://') || evento.local.startsWith('https://') ? (
                            <a 
                              href={evento.local} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline block"
                              title={evento.local}
                            >
                              Ver local
                            </a>
                          ) : (
                            <span className="break-words block">{evento.local}</span>
                          )}
                        </div>
                      </div>
                      {evento.cidade && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                          <span className="text-muted-foreground text-xs">{evento.cidade}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Coins className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{evento.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    </div>
                    
                     {evento.fotografos && evento.fotografos.length > 0 && (
                       <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md mb-3">
                         <User className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                         <div className="min-w-0 flex-1">
                           <span className="text-xs font-medium text-foreground block">
                             {evento.fotografos.length === 1 ? 'Fotógrafo:' : 'Fotógrafos:'} 
                           </span>
                           <div className="text-primary text-xs">
                             {evento.fotografos.length > 1 && !expandedFotografos[evento.id] ? (
                               <div className="break-words">
                                 {evento.fotografos[0]}{' '}
                                 <button 
                                   onClick={() => toggleFotografos(evento.id)}
                                   className="text-primary hover:underline text-xs inline"
                                 >
                                   e mais {evento.fotografos.length - 1}
                                 </button>
                               </div>
                             ) : (
                               <>
                                 {evento.fotografos.map((fotografo, index) => (
                                   <div key={index} className="break-words">{fotografo}</div>
                                 ))}
                                 {evento.fotografos.length > 1 && (
                                   <button 
                                     onClick={() => toggleFotografos(evento.id)}
                                     className="text-primary hover:underline text-xs mt-1 block"
                                   >
                                     Mostrar menos
                                   </button>
                                 )}
                               </>
                             )}
                           </div>
                         </div>
                       </div>
                     )}

                     {evento.descricao && (
                       <div className="text-xs text-muted-foreground mb-3">
                         {evento.descricao.length > MAX_DESCRIPTION_LENGTH && !expandedDescriptions[evento.id] ? (
                           <p className="break-words">
                             {evento.descricao.substring(0, MAX_DESCRIPTION_LENGTH)}...{' '}
                             <button 
                               onClick={() => toggleDescription(evento.id)}
                               className="text-primary hover:underline text-xs inline"
                             >
                               Mostrar mais
                             </button>
                           </p>
                         ) : (
                           <>
                             <p className="break-words">{evento.descricao}</p>
                             {evento.descricao.length > MAX_DESCRIPTION_LENGTH && (
                               <button 
                                 onClick={() => toggleDescription(evento.id)}
                                 className="text-primary hover:underline text-xs mt-1 block"
                               >
                                 Mostrar menos
                               </button>
                             )}
                           </>
                         )}
                       </div>
                     )}
                  </div>
                  
                    <div className="flex items-center gap-0 w-auto" style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', paddingLeft: '10px', width: '60px', marginTop: '-8px'}}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            aria-label="Excluir evento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o evento <strong>{evento.cliente}</strong>?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(evento.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(evento)}
                        aria-label="Editar evento"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))
          )
        ) : (
          <Card className="shadow-soft">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro evento'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Eventos;