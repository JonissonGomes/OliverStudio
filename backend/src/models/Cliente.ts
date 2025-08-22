import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ClienteDocument extends Document {
	userId: string;
	nome: string;
	email: string;
	telefone: string;
	cidade?: string;
	dataNascimento?: string;
	mensagem?: string;
	origem?: 'instagram' | 'facebook' | 'linkedin' | 'indicacao' | 'outros' | string;
	eventos: string[];
	// Campos para rastrear conversão de leads
	convertedFromLead?: boolean;
	leadConversionDate?: Date;
	leadSource?: string; // origem do lead (instagram, facebook, etc.)
	leadMessage?: string; // mensagem original do lead
	leadEventType?: string; // tipo de evento do lead
	createdAt: Date;
	updatedAt: Date;
}

const ClienteSchema = new Schema<ClienteDocument>(
	{
		userId: { type: String, required: true, index: true },
		nome: { type: String, required: true },
		email: { type: String, required: true },
		telefone: { type: String, required: true },
		cidade: { type: String },
		dataNascimento: { type: String },
		mensagem: { type: String },
		origem: { type: String },
		eventos: { type: [String], default: [] },
		// Campos para rastrear conversão de leads
		convertedFromLead: { type: Boolean, default: false },
		leadConversionDate: { type: Date },
		leadSource: { type: String },
		leadMessage: { type: String },
		leadEventType: { type: String },
	},
	{ timestamps: true }
);

ClienteSchema.index({ userId: 1, nome: 1 });
ClienteSchema.index({ userId: 1, cidade: 1 });

export const ClienteModel: Model<ClienteDocument> = mongoose.models.Cliente || mongoose.model<ClienteDocument>('Cliente', ClienteSchema); 