import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { ClienteModel } from '../models/Cliente';

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
});

router.post('/leads', async (req: Request, res: Response) => {
	const parse = leadSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ message: 'Dados inválidos', errors: parse.error.issues });
	const { nome, email, telefone, mensagem, origem } = parse.data;

	// Armazena como Cliente com userId fixo "public" para posterior triagem
	const doc = await ClienteModel.create({
		userId: 'public',
		nome,
		email,
		telefone,
		mensagem,
		origem,
	});
	return res.status(201).json({ id: String(doc._id) });
});

export default router; 