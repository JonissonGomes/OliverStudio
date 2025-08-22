import mongoose, { Schema, Document, Model } from 'mongoose';

export interface FotografoDocument extends Document {
	userId: string;
	nome: string;
	contato: string;
	email?: string;
	especialidades: string[];
	createdAt: Date;
	updatedAt: Date;
}

const FotografoSchema = new Schema<FotografoDocument>(
	{
		userId: { type: String, required: true, index: true },
		nome: { type: String, required: true },
		contato: { type: String, required: true },
		email: { type: String },
		especialidades: { type: [String], default: [] },
	},
	{ timestamps: true }
);

export const FotografoModel: Model<FotografoDocument> = mongoose.models.Fotografo || mongoose.model<FotografoDocument>('Fotografo', FotografoSchema); 