import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { EventoModel } from '../models/Evento';
import nodemailer from 'nodemailer';

const router = Router();

function requireAdmin(req: AuthenticatedRequest, res: Response, next: Function) {
	if (!req.user?.roles?.includes('admin')) {
		return res.status(403).json({ message: 'Forbidden' });
	}
	next();
}

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT || 587),
	secure: false,
	auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
	const users = await UserModel.find({}).sort({ createdAt: -1 }).lean();
	res.json(users.map(u => ({
		id: String(u._id),
		first_name: u.fullName?.split(' ')[0] || '',
		last_name: u.fullName?.split(' ').slice(1).join(' ') || '',
		email: u.email,
		status: u.status,
		roles: u.roles,
		created_at: u.createdAt,
	})));
});

// Rota para buscar usuários com cargo de fotógrafo (não requer admin)
router.get('/fotografos', requireAuth, async (_req, res) => {
	const users = await UserModel.find({ 
		roles: 'fotografo', 
		status: 'approved' 
	}).lean();
	
	res.json(users.map(u => ({
		id: String(u._id),
		first_name: u.fullName?.split(' ')[0] || '',
		last_name: u.fullName?.split(' ').slice(1).join(' ') || '',
		email: u.email,
		status: u.status,
		roles: u.roles,
		especialidades: u.especialidades || [], // Incluir especialidades
	})));
});

// Rota para editar usuário (nome, email e especialidades)
const userUpdateSchema = z.object({ 
	fullName: z.string().min(1).optional(),
	email: z.string().email().optional(),
	especialidades: z.array(z.string()).optional() // Adicionar especialidades
});

router.put('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	const parse = userUpdateSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	
	const user = await UserModel.findById(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	
	if (parse.data.fullName) user.fullName = parse.data.fullName;
	if (parse.data.email) user.email = parse.data.email;
	if (parse.data.especialidades !== undefined) user.especialidades = parse.data.especialidades; // Atualizar especialidades
	
	await user.save();
	res.json({ ok: true });
});

const statusSchema = z.object({ status: z.enum(['approved', 'rejected', 'pending']) });
router.post('/:id/status', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	const parse = statusSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	const user = await UserModel.findById(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	user.status = parse.data.status;
	await user.save();

	if (parse.data.status === 'approved' && process.env.SMTP_HOST && process.env.SMTP_FROM) {
		try {
			await transporter.sendMail({
				from: process.env.SMTP_FROM,
				to: user.email,
				subject: 'Sua conta foi aprovada',
				html: `<p>Olá${user.fullName ? `, ${user.fullName}` : ''}!</p><p>Sua conta foi aprovada e já pode acessar o sistema.</p>`,
			});
		} catch (e) {
			console.warn('Falha ao enviar email de aprovação:', e);
		}
	}

	res.json({ ok: true });
});

const roleSchema = z.object({ role: z.string().min(1) });
router.post('/:id/roles', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	const parse = roleSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	await UserModel.updateOne({ _id: req.params.id }, { $addToSet: { roles: parse.data.role } });
	res.json({ ok: true });
});

router.delete('/:id/roles', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	const parse = roleSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });

	// Impede remover a própria role admin
	if (req.user?.id === req.params.id && parse.data.role === 'admin') {
		return res.status(400).json({ message: 'Você não pode remover seu próprio cargo de administrador' });
	}

	try {
		// Se for remoção do cargo de fotógrafo, limpar eventos
		if (parse.data.role === 'fotografo') {
			const user = await UserModel.findById(req.params.id);
			if (user) {
				const fullName = user.fullName;
				if (fullName) {
					// Limpar referências nos eventos de todos os usuários
					await EventoModel.updateMany(
						{ fotografos: fullName },
						{ $pull: { fotografos: fullName } }
					);
				}
			}
		}

		await UserModel.updateOne({ _id: req.params.id }, { $pull: { roles: parse.data.role } });
		res.json({ ok: true });
	} catch (error) {
		console.error('Erro ao remover role:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

export default router; 