import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { EventoModel } from '../models/Evento';

const router = Router();

const recorrenciaSchema = z.object({
	tipo: z.enum(['diaria', 'semanal', 'mensal', 'anual']),
	frequencia: z.number().int().min(1),
	dataFim: z.string().optional(),
	totalOcorrencias: z.number().int().min(1).optional(),
}).optional();

const eventoSchema = z.object({
	cliente: z.string().min(1),
	clienteId: z.string().optional(),
	email: z.string().email(),
	telefone: z.string().min(1),
	tipoEvento: z.enum(['estudio', 'evento', 'aniversario', 'mesversario', 'gestante', 'formatura', 'debutante', 'casamento']),
	data: z.string(), // ISO
	inicio: z.string(),
	termino: z.string(),
	local: z.string().min(1),
	cidade: z.string().min(1),
	descricao: z.string().default(''),
	preco: z.number(),
	fotografos: z.array(z.string()).default([]),
	driveLink: z.string().optional(),
	status: z.enum(['pendente', 'concluido', 'cancelado']),
	recorrencia: recorrenciaSchema,
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const items = await EventoModel.find({ userId: req.user!.id }).sort({ data: -1 }).lean();
	// Converte Date para ISO na resposta para compatibilidade com FE
	res.json(items.map(i => ({ ...i, id: String(i._id), data: new Date(i.data).toISOString().slice(0,10) })));
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const parse = eventoSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	const payload = { ...parse.data, data: new Date(parse.data.data) } as any;
	const doc = await EventoModel.create({ ...payload, userId: req.user!.id });
	res.status(201).json({ id: String(doc._id) });
});

router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const parse = eventoSchema.partial().safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	const update: any = { ...parse.data };
	if (update.data) update.data = new Date(update.data);
	await EventoModel.updateOne({ _id: req.params.id, userId: req.user!.id }, { $set: update });
	res.json({ ok: true });
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	await EventoModel.deleteOne({ _id: req.params.id, userId: req.user!.id });
	res.json({ ok: true });
});

export default router; 