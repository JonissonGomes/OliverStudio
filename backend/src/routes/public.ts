import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { LeadModel } from '../models/Lead';

const router = Router();

// Rate limit: 10 requisições por 10 minutos por IP
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { message: 'Muitas solicitações. Tente novamente mais tarde.' }
});

router.use('/leads', limiter);

const leadSchema = z.object({
	// Honeypot opcional: se preenchido, rejeita
	hp: z.string().max(0).optional(),
	nome: z.string().min(1),
	email: z.string().email(),
	telefone: z.string().min(6),
	tipoEvento: z.string().min(1),
	mensagem: z.string().max(2000).optional(),
	origem: z.enum(['instagram','facebook','linkedin','indicacao','outros']).optional(),
	comoConheceu: z.string().optional(),
});

router.post('/leads', async (req: Request, res: Response) => {
	const parse = leadSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Dados inválidos', errors: parse.error.issues });
	const { nome, email, telefone, mensagem, origem, tipoEvento } = parse.data;

	// Verificar se já existe um lead com este email (duplicado)
	const existingLead = await LeadModel.findOne({ email, status: { $nin: ['convertido', 'rejeitado'] } });
	if (existingLead) {
		return res.status(409).json({ message: 'Já existe um lead ativo com este email' });
	}

	// Calcular data de expiração (30 dias a partir de hoje)
	const dataExpiracao = new Date();
	dataExpiracao.setDate(dataExpiracao.getDate() + 30);

	// Calcular score de qualidade baseado nos dados fornecidos
	let scoreQualidade = 5; // Score base
	if (telefone && telefone.length >= 10) scoreQualidade += 1;
	if (mensagem && mensagem.length > 10) scoreQualidade += 1;
	if (origem && origem !== 'outros') scoreQualidade += 1;
	if (tipoEvento && tipoEvento.length > 0) scoreQualidade += 1;

	// Armazena como Lead com status 'pendente'
	const doc = await LeadModel.create({
		userId: 'public',
		nome,
		email,
		telefone,
		mensagem,
		origem,
		tipoEvento,
		status: 'pendente',
		scoreQualidade: Math.min(scoreQualidade, 10),
		dataExpiracao,
		tentativasContato: 0
	});
	return res.status(201).json({ id: String(doc._id) });
});

export default router; 