import { Schema, model, Document } from 'mongoose';

export interface LeadDocument extends Document {
	nome: string;
	email: string;
	telefone: string;
	tipoEvento: string;
	mensagem?: string;
	origem?: string;
	comoConheceu?: string;
	userId: string;
	// Sistema de status e qualificação
	status: 'pendente' | 'em_contato' | 'convertido' | 'rejeitado' | 'expirado' | 'duplicado';
	scoreQualidade?: number; // 1-10
	motivoRejeicao?: string;
	dataExpiracao?: Date;
	dataPrimeiroContato?: Date;
	dataUltimoContato?: Date;
	tentativasContato: number;
	observacoes?: string;
	// Campos de rastreamento
	convertedToClienteId?: string; // ID do cliente se convertido
	dataConversao?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const LeadSchema = new Schema<LeadDocument>(
	{
		nome: { type: String, required: true },
		email: { type: String, required: true },
		telefone: { type: String, required: true },
		tipoEvento: { type: String, required: true },
		mensagem: { type: String },
		origem: { type: String },
		comoConheceu: { type: String },
		userId: { type: String, required: true, index: true },
		// Sistema de status e qualificação
		status: { type: String, enum: ['pendente', 'em_contato', 'convertido', 'rejeitado', 'expirado', 'duplicado'], default: 'pendente' },
		scoreQualidade: { type: Number, min: 1, max: 10 },
		motivoRejeicao: { type: String },
		dataExpiracao: { type: Date },
		dataPrimeiroContato: { type: Date },
		dataUltimoContato: { type: Date },
		tentativasContato: { type: Number, default: 0 },
		observacoes: { type: String },
		// Campos de rastreamento
		convertedToClienteId: { type: String },
		dataConversao: { type: Date }
	},
	{ timestamps: true }
);

export const LeadModel = model<LeadDocument>('Lead', LeadSchema); 