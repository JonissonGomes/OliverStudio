import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { LeadModel } from '../models/Lead';
import { z } from 'zod';

const router = Router();

const leadSchema = z.object({
	nome: z.string().min(1),
	email: z.string().email(),
	telefone: z.string().min(1),
	tipoEvento: z.string().min(1),
	mensagem: z.string().optional(),
	origem: z.string().optional(),
	comoConheceu: z.string().optional()
});

// Rota para listar todos os leads (sem filtro de userId)
router.get('/', requireAuth, async (_req, res) => {
	try {
		// Filtrar apenas leads ativos (não convertidos)
		const leads = await LeadModel.find({ 
			status: { $nin: ['convertido'] } 
		}).sort({ createdAt: -1 });
		res.json(leads);
	} catch (error) {
		console.error('Erro ao buscar leads:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para buscar lead por ID (sem filtro de userId)
router.get('/:id', requireAuth, async (req, res) => {
	try {
		const lead = await LeadModel.findById(req.params.id);
		if (!lead) {
			return res.status(404).json({ message: 'Lead não encontrado' });
		}
		res.json(lead);
	} catch (error) {
		console.error('Erro ao buscar lead:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para criar lead (apenas admin, gerente, assistente)
router.post('/', requireAuth, requireRole(['admin', 'gerente', 'assistente']), async (req: AuthenticatedRequest, res: Response) => {
	const parse = leadSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });

	try {
		const lead = new LeadModel({
			...parse.data,
			userId: req.user!.id
		});
		await lead.save();
		res.status(201).json(lead);
	} catch (error) {
		console.error('Erro ao criar lead:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para atualizar lead (apenas admin, gerente, assistente)
router.put('/:id', requireAuth, requireRole(['admin', 'gerente', 'assistente']), async (req: AuthenticatedRequest, res: Response) => {
	const parse = leadSchema.partial().safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });

	try {
		const lead = await LeadModel.findByIdAndUpdate(
			req.params.id,
			parse.data,
			{ new: true }
		);
		if (!lead) {
			return res.status(404).json({ message: 'Lead não encontrado' });
		}
		res.json(lead);
	} catch (error) {
		console.error('Erro ao atualizar lead:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para atualizar status do lead (apenas admin, gerente, assistente)
router.patch('/:id/status', requireAuth, requireRole(['admin', 'gerente', 'assistente']), async (req: AuthenticatedRequest, res: Response) => {
	const statusSchema = z.object({
		status: z.enum(['pendente', 'em_contato', 'convertido', 'rejeitado', 'expirado', 'duplicado']),
		motivoRejeicao: z.string().optional(),
		observacoes: z.string().optional(),
		scoreQualidade: z.number().min(1).max(10).optional()
	});

	const parse = statusSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });

	try {
		const { status, motivoRejeicao, observacoes, scoreQualidade } = parse.data;
		const updateData: any = { status };

		if (status === 'rejeitado' && motivoRejeicao) {
			updateData.motivoRejeicao = motivoRejeicao;
		}

		if (observacoes) {
			updateData.observacoes = observacoes;
		}

		if (scoreQualidade) {
			updateData.scoreQualidade = scoreQualidade;
		}

		if (status === 'em_contato') {
			updateData.dataUltimoContato = new Date();
			updateData.tentativasContato = { $inc: 1 };
		}

		const lead = await LeadModel.findByIdAndUpdate(
			req.params.id,
			updateData,
			{ new: true }
		);

		if (!lead) {
			return res.status(404).json({ message: 'Lead não encontrado' });
		}

		res.json(lead);
	} catch (error) {
		console.error('Erro ao atualizar status do lead:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para registrar contato com lead (apenas admin, gerente, assistente)
router.patch('/:id/contato', requireAuth, requireRole(['admin', 'gerente', 'assistente']), async (req: AuthenticatedRequest, res: Response) => {
	const contatoSchema = z.object({
		observacoes: z.string().min(1),
		proximoContato: z.string().optional() // Data do próximo contato
	});

	const parse = contatoSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });

	try {
		const { observacoes, proximoContato } = parse.data;
		const updateData: any = {
			status: 'em_contato',
			dataUltimoContato: new Date(),
			tentativasContato: { $inc: 1 },
			observacoes: observacoes
		};

		if (proximoContato) {
			updateData.dataExpiracao = new Date(proximoContato);
		}

		const lead = await LeadModel.findByIdAndUpdate(
			req.params.id,
			updateData,
			{ new: true }
		);

		if (!lead) {
			return res.status(404).json({ message: 'Lead não encontrado' });
		}

		res.json(lead);
	} catch (error) {
		console.error('Erro ao registrar contato:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para buscar leads por status
router.get('/status/:status', requireAuth, async (req, res) => {
	try {
		const { status } = req.params;
		const leads = await LeadModel.find({ status }).sort({ createdAt: -1 });
		res.json(leads);
	} catch (error) {
		console.error('Erro ao buscar leads por status:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para buscar leads convertidos (para relatórios)
router.get('/convertidos', requireAuth, async (req, res) => {
	try {
		const leads = await LeadModel.find({ 
			status: 'convertido' 
		}).sort({ dataConversao: -1 });
		res.json(leads);
	} catch (error) {
		console.error('Erro ao buscar leads convertidos:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para expirar leads automaticamente (pode ser chamada por cron job)
router.post('/expirar', requireAuth, requireRole(['admin', 'gerente']), async (req, res) => {
	try {
		const agora = new Date();
		const resultado = await LeadModel.updateMany(
			{
				status: { $in: ['pendente', 'em_contato'] },
				dataExpiracao: { $lt: agora }
			},
			{
				$set: {
					status: 'expirado',
					observacoes: 'Lead expirado automaticamente - prazo de contato vencido'
				}
			}
		);

		res.json({
			message: `${resultado.modifiedCount} leads foram expirados automaticamente`,
			leadsExpirados: resultado.modifiedCount
		});
	} catch (error) {
		console.error('Erro ao expirar leads:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para buscar leads expirados
router.get('/expirados', requireAuth, async (req, res) => {
	try {
		const agora = new Date();
		const leads = await LeadModel.find({
			status: { $in: ['pendente', 'em_contato'] },
			dataExpiracao: { $lt: agora }
		}).sort({ dataExpiracao: 1 });

		res.json(leads);
	} catch (error) {
		console.error('Erro ao buscar leads expirados:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para deletar lead (apenas admin, gerente)
router.delete('/:id', requireAuth, requireRole(['admin', 'gerente']), async (req: AuthenticatedRequest, res: Response) => {
	try {
		await LeadModel.deleteOne({ _id: req.params.id });
		res.json({ ok: true });
	} catch (error) {
		console.error('Erro ao deletar lead:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

export default router; 
 
 