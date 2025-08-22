import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { ClienteModel } from '../models/Cliente';

const router = Router();

const clienteSchema = z.object({
	nome: z.string().min(1),
	email: z.string().email(),
	telefone: z.string().min(1),
	cidade: z.string().optional(),
	dataNascimento: z.string().optional(),
	mensagem: z.string().optional(),
	origem: z.enum(['instagram','facebook','linkedin','indicacao','outros']).optional(),
	eventos: z.array(z.string()).default([]),
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const items = await ClienteModel.find({ userId: req.user!.id }).sort({ nome: 1 }).lean();
	res.json(items.map(i => ({
		id: String(i._id),
		nome: i.nome,
		email: i.email,
		telefone: i.telefone,
		cidade: i.cidade,
		dataNascimento: i.dataNascimento,
		mensagem: i.mensagem,
		origem: i.origem,
		eventos: i.eventos || [],
	})));
});

router.get('/leads', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
	const leads = await ClienteModel.find({ userId: 'public' }).sort({ createdAt: -1 }).lean();
	res.json(leads.map(i => ({
		id: String(i._id),
		nome: i.nome,
		email: i.email,
		telefone: i.telefone,
		mensagem: i.mensagem,
		origem: i.origem,
		isLead: true,
	})));
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const parse = clienteSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	const doc = await ClienteModel.create({ ...parse.data, userId: req.user!.id });
	res.status(201).json({ id: String(doc._id) });
});

router.post('/:id/convert', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const id = req.params.id;
	const doc = await ClienteModel.findById(id);
	if (!doc) return res.status(404).json({ message: 'Lead não encontrado' });
	if (doc.userId !== 'public') return res.status(400).json({ message: 'Este registro não é um lead' });
	await ClienteModel.updateOne({ _id: id, userId: 'public' }, { $set: { userId: req.user!.id }, $unset: { mensagem: '' } });
	return res.json({ ok: true });
});

router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const parse = clienteSchema.partial().safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	await ClienteModel.updateOne({ _id: req.params.id, userId: req.user!.id }, { $set: parse.data });
	res.json({ ok: true });
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	await ClienteModel.deleteOne({ _id: req.params.id, userId: req.user!.id });
	res.json({ ok: true });
});

export default router; 