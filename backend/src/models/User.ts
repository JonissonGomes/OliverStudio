import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
	email: string;
	fullName?: string;
	phone?: string;
	passwordHash: string;
	roles: string[];
	status: 'pending' | 'approved' | 'rejected';
	especialidades?: string[]; // Campo para especialidades de fotógrafos
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
	{
		email: { type: String, required: true, unique: true, index: true },
		fullName: { type: String },
		phone: { type: String },
		passwordHash: { type: String, required: true },
		roles: { type: [String], default: ['user'] },
		status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
		especialidades: { type: [String], default: [] }, // Array de especialidades
	},
	{ timestamps: true }
);

export const UserModel: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema); 