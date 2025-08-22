import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar, TrendingUp, Users, DollarSign, Target, Loader2, UserPlus, MapPin } from 'lucide-react';
import { useEventos } from '@/hooks/useEventos';
import { useClientes, useLeadConversionAnalytics } from '@/hooks/useClientes';
import { Event, Cliente, TIPOS_EVENTO } from '@/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@/lib/api';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

export default function Analytics() {
  const { eventos, loading: eventosLoading } = useEventos();
  const { clientes, loading: clientesLoading } = useClientes();
  const { data: leadConversionData, loading: leadConversionLoading } = useLeadConversionAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedCity, setSelectedCity] = useState('all');

  const loading = eventosLoading || clientesLoading || leadConversionLoading;

  // Índices para acelerar joins/consultas
  const nomeToCidade = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clientes) map.set(c.nome, c.cidade || 'Não informado');
    return map;
  }, [clientes]);

  const eventosIdx = useMemo(() => {
    return eventos.map((e) => ({ ...e, dataTs: Date.parse(e.data) }));
  }, [eventos]);

  // Filtrar eventos baseado no período selecionado
  const filteredEventos = useMemo(() => {
    const now = Date.now();
    let startDateTs: number;

    switch (selectedPeriod) {
      case '1month':
        startDateTs = subMonths(new Date(now), 1).getTime();
        break;
      case '3months':
        startDateTs = subMonths(new Date(now), 3).getTime();
        break;
      case '6months':
        startDateTs = subMonths(new Date(now), 6).getTime();
        break;
      case '1year':
        startDateTs = subMonths(new Date(now), 12).getTime();
        break;
      default:
        startDateTs = subMonths(new Date(now), 6).getTime();
    }

    return eventosIdx.filter((evento) => {
      const cityMatch = selectedCity === 'all' || (evento.cidade === selectedCity);
      return evento.dataTs >= startDateTs && evento.dataTs <= now && cityMatch;
    });
  }, [eventosIdx, selectedPeriod, selectedCity]);

  // Obter lista de cidades únicas
  const cidades = useMemo(() => {
    const cidadesSet = new Set<string>();
    for (const evento of eventos) if (evento.cidade) cidadesSet.add(evento.cidade);
    return Array.from(cidadesSet).sort();
  }, [eventos]);

  // Métricas principais
  const metricas = useMemo(() => {
    let totalReceita = 0;
    let totalEventos = filteredEventos.length;
    const clientesSet = new Set<string>();
    for (const e of filteredEventos) {
      totalReceita += e.preco;
      clientesSet.add(e.cliente);
    }
    const mediaEvento = totalEventos > 0 ? totalReceita / totalEventos : 0;
    return { totalReceita, totalEventos, mediaEvento, clientesUnicos: clientesSet.size };
  }, [filteredEventos]);

  // Receita por cidade
  const receitaPorCidade = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredEventos) {
      const cidade = e.cidade || 'Não informado';
      map.set(cidade, (map.get(cidade) || 0) + e.preco);
    }
    return Array.from(map.entries()).map(([cidade, receita]) => ({ cidade, receita })).sort((a, b) => b.receita - a.receita);
  }, [filteredEventos]);

  // Distribuição de clientes por cidade
  const clientesPorCidade = useMemo(() => {
    const cidadeClientes = new Map<string, number>();
    for (const c of clientes) {
      const cidade = c.cidade || 'Não informado';
      cidadeClientes.set(cidade, (cidadeClientes.get(cidade) || 0) + 1);
    }
    const total = clientes.length;
    return Array.from(cidadeClientes.entries())
      .map(([cidade, quantidade]) => ({ cidade, quantidade, percentual: total > 0 ? (quantidade / total) * 100 : 0 }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [clientes]);

  // Tipos de eventos mais populares
  const eventosPorTipo = useMemo(() => {
    const tipoEventos = new Map<string, { quantidade: number; receita: number }>();
    for (const e of filteredEventos) {
      const tipoLabel = TIPOS_EVENTO.find(t => t.value === e.tipoEvento)?.label || e.tipoEvento;
      const cur = tipoEventos.get(tipoLabel) || { quantidade: 0, receita: 0 };
      cur.quantidade += 1;
      cur.receita += e.preco;
      tipoEventos.set(tipoLabel, cur);
    }
    return Array.from(tipoEventos.entries()).map(([tipo, data]) => ({ tipo, ...data })).sort((a, b) => b.receita - a.receita);
  }, [filteredEventos]);

  // Evolução mensal da receita
  const evolucaoMensal = useMemo(() => {
    const now = new Date();
    const startDate = subMonths(now, parseInt(selectedPeriod.replace(/\D/g, '')) || 6);
    const months = eachMonthOfInterval({ start: startDate, end: now });
    return months.map(month => {
      const startOfMonthDate = startOfMonth(month);
      const endOfMonthDate = endOfMonth(month);
      let receita = 0;
      let count = 0;
      const startTs = startOfMonthDate.getTime();
      const endTs = endOfMonthDate.getTime();
      for (const e of filteredEventos) {
        if (e.dataTs >= startTs && e.dataTs <= endTs) {
          receita += e.preco;
          count += 1;
        }
      }
      return { mes: format(month, 'MMM/yyyy', { locale: ptBR }), receita, eventos: count };
    });
  }, [filteredEventos, selectedPeriod]);

  // Top clientes por valor
  const topClientes = useMemo(() => {
    const clienteReceita = new Map<string, number>();
    for (const e of filteredEventos) clienteReceita.set(e.cliente, (clienteReceita.get(e.cliente) || 0) + e.preco);
    return Array.from(clienteReceita.entries()).map(([cliente, receita]) => ({ cliente, receita })).sort((a, b) => b.receita - a.receita).slice(0, 10);
  }, [filteredEventos]);

  // Opcional: tentar buscar do backend (agregação). Mantém fallback local se falhar.
  const [serverData, setServerData] = useState<any | null>(null);
  useEffect(() => {
    const now = new Date();
    const months = Number((selectedPeriod.match(/\d+/)?.[0]) || '6');
    const from = subMonths(now, months).toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);
    const qs = new URLSearchParams({ from, to, city: selectedCity });
    apiRequest(`/analytics/summary?${qs.toString()}`)
      .then(setServerData)
      .catch(() => setServerData(null));
  }, [selectedPeriod, selectedCity]);

  const metricasFinal = serverData?.metricas
    ? {
        totalReceita: Number(serverData.metricas.totalReceita) || 0,
        totalEventos: Number(serverData.metricas.totalEventos) || 0,
        clientesUnicos: Number(serverData.metricas.clientesUnicos) || 0,
        mediaEvento:
          (Number(serverData.metricas.totalEventos) || 0) > 0
            ? (Number(serverData.metricas.totalReceita) || 0) /
              Number(serverData.metricas.totalEventos)
            : 0,
      }
    : metricas;
  const receitaPorCidadeFinal = serverData?.receitaPorCidade || receitaPorCidade;
  const eventosPorTipoFinal = serverData?.eventosPorTipo || eventosPorTipo;
  const evolucaoMensalFinal = serverData?.evolucaoMensal || evolucaoMensal;
  const topClientesFinal = serverData?.topClientes || topClientes;

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Financeiro</h1>
        <p className="text-muted-foreground">Análise detalhada dos seus dados financeiros e de clientes</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Último mês</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Cidade</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cidades.map(cidade => (
                    <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">R$ {metricasFinal.totalReceita.toLocaleString('pt-BR')},00</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{metricasFinal.totalEventos}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Médio/Evento</p>
                <p className="text-2xl font-bold">R$ {metricasFinal.mediaEvento.toLocaleString('pt-BR')},00</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Únicos</p>
                <p className="text-2xl font-bold">{metricasFinal.clientesUnicos}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Conversão de Leads */}
      {leadConversionData ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Conversão de Leads</h2>
            <p className="text-muted-foreground">Análise da performance de conversão de leads para clientes</p>
          </div>

          {/* Métricas de conversão */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Convertidos</p>
                    <p className="text-2xl font-bold">{leadConversionData.metricas?.totalConvertidos || 0}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Leads Ativos</p>
                    <p className="text-2xl font-bold">{leadConversionData.metricas?.leadsPendentes || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Criados</p>
                    <p className="text-2xl font-bold">{leadConversionData.metricas?.totalLeadsCriados || 0}</p>
                  </div>
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                    <p className="text-2xl font-bold">{leadConversionData.metricas?.taxaConversao || 0}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de conversão */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversões por Origem */}
            <Card>
              <CardHeader>
                <CardTitle>Conversões por Origem</CardTitle>
                <CardDescription>Performance por canal de marketing</CardDescription>
              </CardHeader>
              <CardContent>
                {leadConversionData.conversoesPorOrigem && leadConversionData.conversoesPorOrigem.length > 0 ? (
                  <ChartContainer config={{ quantidade: { label: 'Quantidade', color: 'hsl(var(--accent))' } }} className="h-[300px] w-full">
                    <BarChart data={leadConversionData.conversoesPorOrigem}>
                      <XAxis dataKey="origem" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="quantidade" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Aguardando dados de conversão</p>
                      <p className="text-sm">As métricas de conversão por origem aparecerão aqui quando houver leads convertidos</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversões por Tipo de Evento */}
            <Card>
              <CardHeader>
                <CardTitle>Conversões por Tipo de Evento</CardTitle>
                <CardDescription>Tipos de eventos mais convertidos</CardDescription>
              </CardHeader>
              <CardContent>
                {leadConversionData.conversoesPorTipoEvento && leadConversionData.conversoesPorTipoEvento.length > 0 ? (
                  <ChartContainer config={{ quantidade: { label: 'Quantidade', color: 'hsl(var(--secondary))' } }} className="h-[300px] w-full">
                    <BarChart data={leadConversionData.conversoesPorTipoEvento}>
                      <XAxis dataKey="tipoEvento" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="quantidade" fill="hsl(var(--secondary))" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Aguardando dados de conversão</p>
                      <p className="text-sm">As métricas de conversão por tipo de evento aparecerão aqui quando houver leads convertidos</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Evolução da conversão */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Conversão</CardTitle>
              <CardDescription>Conversões ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {leadConversionData.evolucaoConversao && leadConversionData.evolucaoConversao.length > 0 ? (
                <ChartContainer config={{ quantidade: { label: 'Conversões', color: 'hsl(var(--primary))' } }} className="h-[300px] w-full">
                  <LineChart data={leadConversionData.evolucaoConversao}>
                    <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="quantidade" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Aguardando dados de conversão</p>
                    <p className="text-sm">A evolução das conversões aparecerá aqui quando houver leads convertidos ao longo do tempo</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Conversão de Leads
            </CardTitle>
            <CardDescription>Análise da performance de conversão de leads para clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center text-muted-foreground">
              <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Sistema de Conversão de Leads</p>
              <p className="text-sm mb-4">Esta seção mostrará métricas detalhadas sobre a conversão de leads para clientes</p>
              <div className="space-y-2 text-xs">
                <p>• <strong>Total Convertidos:</strong> Quantos leads foram convertidos para clientes</p>
                <p>• <strong>Leads Ativos:</strong> Quantos leads ainda estão aguardando conversão</p>
                <p>• <strong>Total Criados:</strong> Total de leads criados no sistema (convertidos + ativos)</p>
                <p>• <strong>Taxa de Conversão:</strong> Percentual de leads convertidos do total criado</p>
                <p>• <strong>Análise por Origem:</strong> Performance de cada canal de marketing</p>
                <p>• <strong>Análise por Tipo:</strong> Quais tipos de eventos são mais convertidos</p>
                <p>• <strong>Evolução Temporal:</strong> Como a conversão evolui ao longo do tempo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita por Cidade */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Cidade</CardTitle>
            <CardDescription>Distribuição da receita por localização</CardDescription>
          </CardHeader>
          <CardContent>
            {receitaPorCidadeFinal && receitaPorCidadeFinal.length > 0 ? (
              <ChartContainer config={{ receita: { label: 'Receita', color: 'hsl(var(--primary))' } }} className="h-[300px] w-full">
                <BarChart data={receitaPorCidadeFinal}>
                  <XAxis dataKey="cidade" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')},00`]} />
                  <Bar dataKey="receita" fill="hsl(var(--primary))" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Aguardando dados de receita</p>
                  <p className="text-sm">O gráfico de receita por cidade aparecerá aqui quando houver eventos com localização definida</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de Clientes por Cidade */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes por Cidade</CardTitle>
            <CardDescription>Percentual de clientes por localização</CardDescription>
          </CardHeader>
          <CardContent>
            {clientesPorCidade && clientesPorCidade.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={clientesPorCidade}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="quantidade"
                    label={({ payload }) => {
                      const cidade = (payload as any)?.cidade ?? 'Não informado';
                      const percentual = Number((payload as any)?.percentual ?? 0);
                      return `${cidade}: ${percentual.toFixed(1)}%`;
                    }}
                  >
                    {clientesPorCidade.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip formatter={(value, name, props) => [`${value} clientes (${props.payload?.percentual?.toFixed(1)}%)`]} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Aguardando dados de clientes</p>
                  <p className="text-sm">O gráfico de distribuição por cidade aparecerá aqui quando houver clientes cadastrados</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipos de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Tipo</CardTitle>
            <CardDescription>Receita e quantidade por tipo de evento</CardDescription>
          </CardHeader>
          <CardContent>
            {eventosPorTipoFinal && eventosPorTipoFinal.length > 0 ? (
              <ChartContainer config={{ receita: { label: 'Receita', color: 'hsl(var(--primary))' }, quantidade: { label: 'Quantidade', color: 'hsl(var(--secondary))' } }} className="h-[300px] w-full">
                <BarChart data={eventosPorTipoFinal}>
                  <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(value, name) => {
                    if (name === 'receita') return [`Receita R$ ${Number(value).toLocaleString('pt-BR')},00`];
                    return [`Quantidade ${value}`];
                  }} />
                  <Bar yAxisId="left" dataKey="receita" fill="hsl(var(--primary))" name="receita" />
                  <Bar yAxisId="right" dataKey="quantidade" fill="hsl(var(--secondary))" name="quantidade" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Aguardando dados de eventos</p>
                  <p className="text-sm">O gráfico de eventos por tipo aparecerá aqui quando houver eventos cadastrados</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Receita ao longo dos meses</CardDescription>
          </CardHeader>
          <CardContent>
            {evolucaoMensalFinal && evolucaoMensalFinal.length > 0 ? (
              <ChartContainer config={{ receita: { label: 'Receita', color: 'hsl(var(--primary))' } }} className="h-[300px] w-full">
                <LineChart data={evolucaoMensalFinal}>
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')},00`]} />
                  <Line type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Aguardando dados de receita</p>
                  <p className="text-sm">O gráfico de evolução mensal aparecerá aqui quando houver eventos com receita no período selecionado</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top 10 Clientes por Receita
          </CardTitle>
          <CardDescription>Clientes que mais geraram receita no período</CardDescription>
        </CardHeader>
        <CardContent>
          {topClientesFinal && topClientesFinal.length > 0 ? (
            <div className="space-y-4">
              {topClientesFinal.map((cliente, index) => (
                <div key={cliente.cliente} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">{index + 1}</Badge>
                    <span className="font-medium">{cliente.cliente}</span>
                  </div>
                  <span className="font-semibold text-primary">R$ {cliente.receita.toLocaleString('pt-BR')},00</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aguardando dados de clientes</p>
              <p className="text-sm">A lista dos top clientes aparecerá aqui quando houver eventos com receita no período selecionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}