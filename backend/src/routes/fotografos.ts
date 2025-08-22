import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { FotografoModel } from '../models/Fotografo';
import { EventoModel } from '../models/Evento';

const router = Router();

const fotografoSchema = z.object({
	nome: z.string().min(1),
	contato: z.string().min(1),
	email: z.string().email().optional(),
	especialidades: z.array(z.string()).default([]),
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const items = await FotografoModel.find({ userId: req.user!.id }).sort({ nome: 1 }).lean();
	res.json(items.map(i => ({
		id: String(i._id),
		nome: i.nome,
		contato: i.contato,
		email: i.email,
		especialidades: i.especialidades || [],
	})));
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const parse = fotografoSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	const doc = await FotografoModel.create({ ...parse.data, userId: req.user!.id });
	res.status(201).json({ id: String(doc._id) });
});

router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	const parse = fotografoSchema.partial().safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	await FotografoModel.updateOne({ _id: req.params.id, userId: req.user!.id }, { $set: parse.data });
	res.json({ ok: true });
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	try {
		// Buscar o fotógrafo antes de deletar para obter o nome
		const fotografo = await FotografoModel.findOne({ _id: req.params.id, userId: req.user!.id });
		if (!fotografo) {
			return res.status(404).json({ message: 'Fotógrafo não encontrado' });
		}

		// Deletar o fotógrafo
		await FotografoModel.deleteOne({ _id: req.params.id, userId: req.user!.id });

		// Limpar referências nos eventos
		await EventoModel.updateMany(
			{ userId: req.user!.id, fotografos: fotografo.nome },
			{ $pull: { fotografos: fotografo.nome } }
		);

		res.json({ ok: true });
	} catch (error) {
		console.error('Erro ao deletar fotógrafo:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

export default router; 