import mongoose, { Schema, Document, Model } from 'mongoose';

export interface EventoDocument extends Document {
	userId: string;
	cliente: string; // nome (legado)
	clienteId?: string; // referência ao Cliente
	email: string;
	telefone: string;
	tipoEvento: 'estudio' | 'evento' | 'aniversario' | 'mesversario' | 'gestante' | 'formatura' | 'debutante' | 'casamento';
	data: Date; // alterado para Date
	inicio: string;
	termino: string;
	local: string;
	cidade: string; // cidade onde será realizado o evento
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
	createdAt: Date;
	updatedAt: Date;
}

const RecorrenciaSchema = new Schema(
	{
		tipo: { type: String, enum: ['diaria', 'semanal', 'mensal', 'anual'] },
		frequencia: { type: Number, required: true },
		dataFim: { type: String },
		totalOcorrencias: { type: Number },
	},
	{ _id: false }
);

const EventoSchema = new Schema<EventoDocument>(
	{
		userId: { type: String, required: true, index: true },
		cliente: { type: String, required: true },
		clienteId: { type: String, required: false, index: true },
		email: { type: String, required: true },
		telefone: { type: String, required: true },
		tipoEvento: { type: String, enum: ['estudio', 'evento', 'aniversario', 'mesversario', 'gestante', 'formatura', 'debutante', 'casamento'], required: true },
		data: { type: Date, required: true },
		inicio: { type: String, required: true },
		termino: { type: String, required: true },
		local: { type: String, required: true },
		cidade: { type: String, required: true },
		descricao: { type: String, default: '' },
		preco: { type: Number, required: true },
		fotografos: { type: [String], default: [] },
		driveLink: { type: String },
		status: { type: String, enum: ['pendente', 'concluido', 'cancelado'], required: true },
		recorrencia: { type: RecorrenciaSchema, required: false },
	},
	{ timestamps: true }
);

EventoSchema.index({ userId: 1, data: 1 });
EventoSchema.index({ userId: 1, tipoEvento: 1 });
EventoSchema.index({ userId: 1, cliente: 1 });
EventoSchema.index({ userId: 1, clienteId: 1 });

export const EventoModel: Model<EventoDocument> = mongoose.models.Evento || mongoose.model<EventoDocument>('Evento', EventoSchema); 