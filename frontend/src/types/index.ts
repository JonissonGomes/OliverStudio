export interface Event {
  id: string;
  cliente: string;
  clienteId?: string;
  email: string;
  telefone: string;
  tipoEvento: 'estudio' | 'evento' | 'aniversario' | 'mesversario' | 'gestante' | 'formatura' | 'debutante' | 'casamento';
  data: string;
  inicio: string;
  termino: string;
  local: string;
  cidade: string;
  descricao: string;
  preco: number;
  fotografos: string[];
  driveLink?: string;
  status: 'pendente' | 'concluido' | 'cancelado';
  recorrencia?: {
    tipo: 'diaria' | 'semanal' | 'mensal' | 'anual';
    frequencia: number;
    dataFim?: string;
    totalOcorrencias?: number;
  };
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade?: string;
  dataNascimento?: string;
  mensagem?: string;
  origem?: string;
  eventos: string[];
  isLead?: boolean;
}

export interface Fotografo {
  id: string;
  nome: string;
  contato: string;
  email?: string;
  especialidades: string[];
}

export const TIPOS_EVENTO = [
  { value: 'estudio', label: 'Estúdio' },
  { value: 'evento', label: 'Evento' },
  { value: 'aniversario', label: 'Aniversário' },
  { value: 'mesversario', label: 'Mesversário' },
  { value: 'gestante', label: 'Gestante' },
  { value: 'formatura', label: 'Formatura' },
  { value: 'debutante', label: 'Debutante' },
  { value: 'casamento', label: 'Casamento' },
] as const;