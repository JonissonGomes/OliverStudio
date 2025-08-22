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
	},
	{ timestamps: true }
);

ClienteSchema.index({ userId: 1, nome: 1 });
ClienteSchema.index({ userId: 1, cidade: 1 });

export const ClienteModel: Model<ClienteDocument> = mongoose.models.Cliente || mongoose.model<ClienteDocument>('Cliente', ClienteSchema); 