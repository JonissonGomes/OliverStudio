import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	fullName: z.string().min(1).max(120),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

const profileUpdateSchema = z.object({
	fullName: z.string().min(1).max(120).optional(),
	phone: z.string().optional(),
});

function signToken(user: { id: string; email: string; roles: string[]; fullName?: string; status?: string }) {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error('JWT secret not configured');
	return jwt.sign(
		{ email: user.email, roles: user.roles, fullName: user.fullName },
		secret,
		{ subject: user.id, expiresIn: '7d' }
	);
}

router.post('/register', async (req: Request, res: Response) => {
	const parse = registerSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	}
	const { email, password, fullName } = parse.data;
	const existing = await UserModel.findOne({ email }).lean();
	if (existing) return res.status(409).json({ message: 'Email já cadastrado' });
	const passwordHash = await bcrypt.hash(password, 10);
	const doc = await UserModel.create({ email, fullName, passwordHash, roles: ['user'] });
	const token = signToken({ id: doc.id, email: doc.email, roles: doc.roles, fullName: doc.fullName, status: doc.status });
	return res.status(201).json({ token, user: { id: doc.id, email: doc.email, roles: doc.roles, fullName: doc.fullName, status: doc.status } });
});

router.post('/login', async (req: Request, res: Response) => {
	const parse = loginSchema.safeParse(req.body);
	if (!parse.success) {
		return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	}
	const { email, password } = parse.data;
	const user = await UserModel.findOne({ email });
	if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });
	const token = signToken({ id: user.id, email: user.email, roles: user.roles, fullName: user.fullName, status: user.status });
	return res.json({ token, user: { id: user.id, email: user.email, roles: user.roles, fullName: user.fullName, status: user.status } });
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
	const doc = await UserModel.findById(req.user.id).lean();
	if (!doc) return res.status(404).json({ message: 'User not found' });
	return res.json({ user: { id: String(doc._id), email: doc.email, roles: doc.roles, fullName: doc.fullName, phone: doc.phone, status: doc.status } });
});

router.put('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const parse = profileUpdateSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	const updated = await UserModel.findByIdAndUpdate(req.user!.id, { $set: parse.data }, { new: true }).lean();
	if (!updated) return res.status(404).json({ message: 'User not found' });
	return res.json({ user: { id: String(updated._id), email: updated.email, roles: updated.roles, fullName: updated.fullName, phone: updated.phone, status: updated.status } });
});

export default router; 