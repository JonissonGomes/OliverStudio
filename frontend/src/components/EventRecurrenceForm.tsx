import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Event } from '@/types';

interface EventRecurrenceFormProps {
  formData: Partial<Event>;
  setFormData: (data: Partial<Event>) => void;
}

export const EventRecurrenceForm: React.FC<EventRecurrenceFormProps> = ({
  formData,
  setFormData,
}) => {
  const [isRecorrente, setIsRecorrente] = React.useState(!!formData.recorrencia);

  const handleRecorrenciaToggle = (checked: boolean) => {
    setIsRecorrente(checked);
    if (!checked) {
      setFormData({
        ...formData,
        recorrencia: undefined,
      });
    } else {
      setFormData({
        ...formData,
        recorrencia: {
          tipo: 'semanal',
          frequencia: 1,
        },
      });
    }
  };

  const updateRecorrencia = (updates: Partial<NonNullable<Event['recorrencia']>>) => {
    setFormData({
      ...formData,
      recorrencia: {
        ...formData.recorrencia!,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="recorrente"
          checked={isRecorrente}
          onCheckedChange={handleRecorrenciaToggle}
        />
        <Label htmlFor="recorrente">Evento recorrente</Label>
      </div>

      {isRecorrente && (
        <div className="space-y-4 pl-6 border-l-2 border-muted">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoRecorrencia">Tipo de recorrência</Label>
              <Select
                value={formData.recorrencia?.tipo || 'semanal'}
                onValueChange={(value: 'diaria' | 'semanal' | 'mensal' | 'anual') =>
                  updateRecorrencia({ tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diaria">Diária</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequencia">Frequência</Label>
              <Input
                id="frequencia"
                type="number"
                min="1"
                value={formData.recorrencia?.frequencia || 1}
                onChange={(e) =>
                  updateRecorrencia({ frequencia: parseInt(e.target.value) || 1 })
                }
                placeholder="A cada quantos períodos"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.recorrencia?.tipo === 'diaria' && 'A cada quantos dias'}
                {formData.recorrencia?.tipo === 'semanal' && 'A cada quantas semanas'}
                {formData.recorrencia?.tipo === 'mensal' && 'A cada quantos meses'}
                {formData.recorrencia?.tipo === 'anual' && 'A cada quantos anos'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataFim">Data de término (opcional)</Label>
              <Input
                id="dataFim"
                type="date"
                value={formData.recorrencia?.dataFim || ''}
                onChange={(e) => updateRecorrencia({ dataFim: e.target.value })}
                min={formData.data}
              />
            </div>

            <div>
              <Label htmlFor="totalOcorrencias">Total de ocorrências (opcional)</Label>
              <Input
                id="totalOcorrencias"
                type="number"
                min="1"
                value={formData.recorrencia?.totalOcorrencias || ''}
                onChange={(e) =>
                  updateRecorrencia({
                    totalOcorrencias: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Número máximo de eventos"
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              {formData.recorrencia?.tipo === 'diaria' &&
                `Evento se repetirá a cada ${formData.recorrencia.frequencia} dia${formData.recorrencia.frequencia > 1 ? 's' : ''}`}
              {formData.recorrencia?.tipo === 'semanal' &&
                `Evento se repetirá a cada ${formData.recorrencia.frequencia} semana${formData.recorrencia.frequencia > 1 ? 's' : ''}`}
              {formData.recorrencia?.tipo === 'mensal' &&
                `Evento se repetirá a cada ${formData.recorrencia.frequencia} mês${formData.recorrencia.frequencia > 1 ? 'es' : ''}`}
              {formData.recorrencia?.tipo === 'anual' &&
                `Evento se repetirá a cada ${formData.recorrencia.frequencia} ano${formData.recorrencia.frequencia > 1 ? 's' : ''}`}
              {formData.recorrencia?.dataFim &&
                ` até ${new Date(formData.recorrencia.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
              {formData.recorrencia?.totalOcorrencias &&
                ` por até ${formData.recorrencia.totalOcorrencias} ocorrências`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};