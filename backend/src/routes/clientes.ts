import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { ClienteModel } from '../models/Cliente';
import { requireRole } from '../middleware/role';
import { LeadModel } from '../models/Lead';

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

// Rota para listar todos os clientes (sem filtro de userId)
router.get('/', requireAuth, async (_req, res) => {
	try {
		const clientes = await ClienteModel.find({}).sort({ nome: 1 });
		res.json(clientes);
	} catch (error) {
		console.error('Erro ao buscar clientes:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para buscar cliente por ID (sem filtro de userId)
router.get('/:id', requireAuth, async (req, res) => {
	try {
		const cliente = await ClienteModel.findById(req.params.id);
		if (!cliente) {
			return res.status(404).json({ message: 'Cliente não encontrado' });
		}
		res.json(cliente);
	} catch (error) {
		console.error('Erro ao buscar cliente:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
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

// Rota para criar cliente (apenas admin, gerente, assistente)
router.post('/', requireAuth, requireRole(['admin', 'gerente', 'assistente']), async (req: AuthenticatedRequest, res: Response) => {
	const parse = clienteSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	const doc = await ClienteModel.create({ ...parse.data, userId: req.user!.id });
	res.status(201).json({ id: String(doc._id) });
});

router.post('/:id/convert', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const leadId = req.params.id;
		
		// Buscar o lead na coleção Lead
		const lead = await LeadModel.findById(leadId);
		if (!lead) {
			return res.status(404).json({ message: 'Lead não encontrado' });
		}
		
		// Verificar se é um lead público e pode ser convertido
		if (lead.userId !== 'public') {
			return res.status(400).json({ message: 'Este registro não é um lead público' });
		}
		
		if (lead.status === 'convertido') {
			return res.status(400).json({ message: 'Este lead já foi convertido anteriormente' });
		}
		
		if (lead.status === 'rejeitado') {
			return res.status(400).json({ message: 'Leads rejeitados não podem ser convertidos' });
		}
		
		// Criar novo cliente com os dados do lead e informações de conversão
		const novoCliente = await ClienteModel.create({
			nome: lead.nome,
			email: lead.email,
			telefone: lead.telefone,
			userId: req.user!.id,
			// Campos opcionais do lead
			...(lead.origem && { origem: lead.origem }),
			// Campos para rastrear conversão de leads
			convertedFromLead: true,
			leadConversionDate: new Date(),
			leadSource: lead.origem || undefined,
			leadMessage: lead.mensagem || undefined,
			leadEventType: lead.tipoEvento || undefined,
		});
		
		// Atualizar o lead para status 'convertido' em vez de removê-lo
		await LeadModel.findByIdAndUpdate(leadId, {
			$set: {
				status: 'convertido',
				convertedToClienteId: String(novoCliente._id),
				dataConversao: new Date()
			}
		});
		
		return res.json({ 
			ok: true, 
			message: 'Lead convertido para cliente com sucesso',
			clienteId: String(novoCliente._id)
		});
	} catch (error) {
		console.error('Erro ao converter lead:', error);
		return res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para atualizar cliente (apenas admin, gerente, assistente)
router.put('/:id', requireAuth, requireRole(['admin', 'gerente', 'assistente']), async (req: AuthenticatedRequest, res: Response) => {
	const parse = clienteSchema.partial().safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Invalid data', errors: parse.error.issues });
	await ClienteModel.updateOne({ _id: req.params.id, userId: req.user!.id }, { $set: parse.data });
	res.json({ ok: true });
});

// Rota para deletar cliente (apenas admin, gerente)
router.delete('/:id', requireAuth, requireRole(['admin', 'gerente']), async (req: AuthenticatedRequest, res: Response) => {
	try {
		await ClienteModel.deleteOne({ _id: req.params.id });
		res.json({ ok: true });
	} catch (error) {
		console.error('Erro ao deletar cliente:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

export default router; 