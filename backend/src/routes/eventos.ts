import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { EventoModel } from '../models/Evento';
import { requireRole } from '../middleware/role';

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

// Rota para listar todos os eventos (sem filtro de userId)
router.get('/', requireAuth, async (_req, res) => {
	try {
		const eventos = await EventoModel.find({}).sort({ data: -1 });
		
		// Formatar eventos para o frontend
		const eventosFormatados = eventos.map(evento => ({
			...evento.toObject(),
			_id: evento._id,
			data: evento.data.toISOString().split('T')[0] // Converter Date para YYYY-MM-DD
		}));
		
		res.json(eventosFormatados);
	} catch (error) {
		console.error('Erro ao buscar eventos:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para buscar evento por ID (sem filtro de userId)
router.get('/:id', requireAuth, async (req, res) => {
	try {
		const evento = await EventoModel.findById(req.params.id);
		if (!evento) {
			return res.status(404).json({ message: 'Evento não encontrado' });
		}
		
		// Formatar evento para o frontend
		const eventoFormatado = {
			...evento.toObject(),
			_id: evento._id,
			data: evento.data.toISOString().split('T')[0] // Converter Date para YYYY-MM-DD
		};
		
		res.json(eventoFormatado);
	} catch (error) {
		console.error('Erro ao buscar evento:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para criar evento (apenas admin, gerente, assistente, fotografo)
router.post('/', requireAuth, requireRole(['admin', 'gerente', 'assistente', 'fotografo']), async (req: AuthenticatedRequest, res: Response) => {
	const parse = eventoSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	
	try {
		const payload = { 
			...parse.data, 
			data: new Date(parse.data.data + 'T00:00:00'), // Adicionar horário para evitar problemas de timezone
			userId: req.user!.id 
		};
		
		const doc = await EventoModel.create(payload);
		res.status(201).json({ id: String(doc._id) });
	} catch (error) {
		console.error('Erro ao criar evento:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para atualizar evento (apenas admin, gerente, assistente, fotografo)
router.put('/:id', requireAuth, requireRole(['admin', 'gerente', 'assistente', 'fotografo']), async (req: AuthenticatedRequest, res: Response) => {
	const parse = eventoSchema.partial().safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	
	const update: any = { ...parse.data };
	
	// Converter data string para Date object se fornecida
	if (update.data) {
		try {
			update.data = new Date(update.data + 'T00:00:00'); // Adicionar horário para evitar problemas de timezone
		} catch (error) {
			return res.status(400).json({ message: 'Data inválida fornecida' });
		}
	}
	
	try {
		await EventoModel.updateOne({ _id: req.params.id }, { $set: update }); // Remover filtro userId
		res.json({ ok: true });
	} catch (error) {
		console.error('Erro ao atualizar evento:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para deletar evento (apenas admin, gerente)
router.delete('/:id', requireAuth, requireRole(['admin', 'gerente']), async (req: AuthenticatedRequest, res: Response) => {
	try {
		await EventoModel.deleteOne({ _id: req.params.id });
		res.json({ ok: true });
	} catch (error) {
		console.error('Erro ao deletar evento:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

export default router; 