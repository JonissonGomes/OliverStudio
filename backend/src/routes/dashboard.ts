import { Router, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { EventoModel } from '../models/Evento';
import { ClienteModel } from '../models/Cliente';

const router = Router();

// Rota para dashboard (todos os usuários autenticados)
router.get('/', requireAuth, async (_req, res) => {
	try {
		// Buscar dados de TODOS os usuários (toda empresa)
		const hoje = new Date();
		hoje.setHours(0, 0, 0, 0);

		const [eventosHoje, totalClientes, totalEventos, totalReceita] = await Promise.all([
			EventoModel.find({ 
				data: { $gte: hoje, $lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000) } 
			}).sort({ data: 1 }),
			ClienteModel.countDocuments({}),
			EventoModel.countDocuments({}),
			EventoModel.aggregate([
				{ $group: { _id: null, total: { $sum: '$preco' } } }
			])
		]);

		const data = {
			eventosHoje: eventosHoje.map(e => ({
				id: String(e._id),
				tipoEvento: e.tipoEvento,
				data: e.data,
				cliente: e.cliente,
				preco: e.preco,
				status: e.status,
				inicio: e.inicio,
				termino: e.termino,
				local: e.local,
				cidade: e.cidade,
				fotografos: e.fotografos
			})),
			totalClientes,
			totalEventos,
			totalReceita: totalReceita[0]?.total || 0
		};

		res.json(data);
	} catch (error) {
		console.error('Erro ao buscar dashboard:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

export default router; 