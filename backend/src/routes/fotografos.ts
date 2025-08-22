import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { FotografoModel } from '../models/Fotografo';
import { EventoModel } from '../models/Evento';
import { requireRole } from '../middleware/role';

const router = Router();

const fotografoSchema = z.object({
	nome: z.string().min(1),
	contato: z.string().min(1),
	email: z.string().email().optional(),
	especialidades: z.array(z.string()).default([]),
});

// Rota para listar todos os fotógrafos (sem filtro de userId)
router.get('/', requireAuth, async (_req, res) => {
	try {
		const fotografos = await FotografoModel.find({}).sort({ nome: 1 });
		res.json(fotografos);
	} catch (error) {
		console.error('Erro ao buscar fotógrafos:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para buscar fotógrafo por ID (sem filtro de userId)
router.get('/:id', requireAuth, async (req, res) => {
	try {
		const fotografo = await FotografoModel.findById(req.params.id);
		if (!fotografo) {
			return res.status(404).json({ message: 'Fotógrafo não encontrado' });
		}
		res.json(fotografo);
	} catch (error) {
		console.error('Erro ao buscar fotógrafo:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para criar fotógrafo (apenas admin, gerente)
router.post('/', requireAuth, requireRole(['admin', 'gerente']), async (req: AuthenticatedRequest, res: Response) => {
	const parse = fotografoSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	const doc = await FotografoModel.create({ ...parse.data, userId: req.user!.id });
	res.status(201).json({ id: String(doc._id) });
});

// Rota para atualizar fotógrafo (apenas admin, gerente)
router.put('/:id', requireAuth, requireRole(['admin', 'gerente']), async (req: AuthenticatedRequest, res: Response) => {
	const parse = fotografoSchema.partial().safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	await FotografoModel.updateOne({ _id: req.params.id, userId: req.user!.id }, { $set: parse.data });
	res.json({ ok: true });
});

// Rota para deletar fotógrafo (apenas admin, gerente)
router.delete('/:id', requireAuth, requireRole(['admin', 'gerente']), async (req: AuthenticatedRequest, res: Response) => {
	try {
		// Buscar o fotógrafo antes de deletar para obter o nome
		const fotografo = await FotografoModel.findById(req.params.id);
		if (!fotografo) {
			return res.status(404).json({ message: 'Fotógrafo não encontrado' });
		}

		// Deletar o fotógrafo
		await FotografoModel.deleteOne({ _id: req.params.id });

		// Limpar referências nos eventos de todos os usuários
		await EventoModel.updateMany(
			{ fotografos: fotografo.nome },
			{ $pull: { fotografos: fotografo.nome } }
		);

		res.json({ ok: true });
	} catch (error) {
		console.error('Erro ao deletar fotógrafo:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

export default router; 