import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { EventoModel } from '../models/Evento';
import { ClienteModel } from '../models/Cliente';
import { LeadModel } from '../models/Lead';
import { requireRole } from '../middleware/role';

const router = Router();

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  city: z.string().optional(),
});

// Cache simples em memória (TTL curto)
interface CacheEntry { data: any; expiresAt: number }
const cache = new Map<string, CacheEntry>();
const TTL_MS = 30_000; // 30s

function cacheKey(userId: string, from?: string, to?: string, city?: string) {
  return `summary:${userId}:${from || ''}:${to || ''}:${city || ''}`;
}

// Rota para analytics (apenas admin, gerente)
router.get('/', requireAuth, requireRole(['admin', 'gerente']), async (req: Request, res: Response) => {
	const parse = querySchema.safeParse(req.query);
	if (!parse.success) return res.status(400).json({ message: 'Invalid query', errors: parse.error.issues });
	const { from, to, city } = parse.data;

	try {
		// Buscar dados de TODOS os usuários (toda empresa)
		const [eventos, clientes, leads] = await Promise.all([
			EventoModel.find({}).lean(),
			ClienteModel.find({}).lean(),
			LeadModel.find({}).lean()
		]);

		const match: any = {};
		if (from || to) {
			match.data = {};
			if (from) match.data.$gte = new Date(from);
			if (to) match.data.$lte = new Date(to);
		}

		const pipeline: any[] = [ { $match: match } ];

		if (city && city !== 'all') {
			pipeline.push(
				{ $lookup: { from: 'clientes', localField: 'cliente', foreignField: 'nome', as: 'clienteDoc' } },
				{ $unwind: { path: '$clienteDoc', preserveNullAndEmptyArrays: true } },
				{ $match: { $or: [{ 'clienteDoc.cidade': city }, { 'clienteDoc.cidade': { $exists: false } }] } },
			);
		}

		const [agg] = await EventoModel.aggregate([
			...pipeline,
			{
				$facet: {
					metricas: [
						{ $group: { _id: null, totalReceita: { $sum: '$preco' }, totalEventos: { $sum: 1 }, clientes: { $addToSet: { $ifNull: ['$clienteId', '$cliente'] } } } },
						{ $project: { _id: 0, totalReceita: 1, totalEventos: 1, clientesUnicos: { $size: '$clientes' } } }
					],
					porTipo: [
						{ $group: { _id: '$tipoEvento', quantidade: { $sum: 1 }, receita: { $sum: '$preco' } } },
						{ $sort: { receita: -1 } },
						{ $project: { _id: 0, tipo: '$_id', quantidade: 1, receita: 1 } }
					],
					porMes: [
						{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$data' } }, receita: { $sum: '$preco' }, eventos: { $sum: 1 } } },
						{ $sort: { _id: 1 } },
						{ $project: { _id: 0, mes: '$_id', receita: 1, eventos: 1 } }
					],
					topClientes: [
						{ $lookup: { from: 'clientes', localField: 'clienteId', foreignField: '_id', as: 'clienteDoc' } },
						{ $unwind: { path: '$clienteDoc', preserveNullAndEmptyArrays: true } },
						{ $group: { _id: { $ifNull: ['$clienteDoc.nome', '$cliente'] }, receita: { $sum: '$preco' } } },
						{ $sort: { receita: -1 } },
						{ $limit: 10 },
						{ $project: { _id: 0, cliente: '$_id', receita: 1 } }
					],
					receitaPorCidade: [
						{ $lookup: { from: 'clientes', localField: 'cliente', foreignField: 'nome', as: 'clienteDoc' } },
						{ $unwind: { path: '$clienteDoc', preserveNullAndEmptyArrays: true } },
						{ $group: { _id: { $ifNull: ['$clienteDoc.cidade', 'Não informado'] }, receita: { $sum: '$preco' } } },
						{ $project: { _id: 0, cidade: '$_id', receita: 1 } },
						{ $sort: { receita: -1 } }
					],
				}
			}
		]);

		const data = {
			metricas: (agg?.metricas?.[0]) || { totalReceita: 0, totalEventos: 0, clientesUnicos: 0 },
			eventosPorTipo: agg?.porTipo || [],
			evolucaoMensal: agg?.porMes || [],
			topClientes: agg?.topClientes || [],
			receitaPorCidade: agg?.receitaPorCidade || [],
		};

		res.setHeader('X-Cache', 'MISS');
		res.setHeader('Cache-Control', 'private, max-age=30');
		return res.json(data);
	} catch (error) {
		console.error('Erro ao buscar analytics:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

// Rota para analytics de conversão de leads (apenas admin, gerente)
router.get('/lead-conversion', requireAuth, requireRole(['admin', 'gerente']), async (req: Request, res: Response) => {
	const parse = querySchema.safeParse(req.query);
	if (!parse.success) return res.status(400).json({ message: 'Invalid query', errors: parse.error.issues });
	const { from, to } = parse.data;

	try {
		const match: any = { convertedFromLead: true };
		if (from || to) {
			match.leadConversionDate = {};
			if (from) match.leadConversionDate.$gte = new Date(from);
			if (to) match.leadConversionDate.$lte = new Date(to);
		}

		const [agg] = await ClienteModel.aggregate([
			{ $match: match },
			{
				$facet: {
					metricas: [
						{ $group: { _id: null, totalConvertidos: { $sum: 1 } } },
						{ $project: { _id: 0, totalConvertidos: 1 } }
					],
					conversoesPorMes: [
						{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$leadConversionDate' } }, quantidade: { $sum: 1 } } },
						{ $sort: { _id: 1 } },
						{ $project: { _id: 0, mes: '$_id', quantidade: 1 } }
					],
					conversoesPorOrigem: [
						{ $group: { _id: '$leadSource', quantidade: { $sum: 1 } } },
						{ $sort: { quantidade: -1 } },
						{ $project: { _id: 0, origem: '$_id', quantidade: 1 } }
					],
					conversoesPorTipoEvento: [
						{ $group: { _id: '$leadEventType', quantidade: { $sum: 1 } } },
						{ $sort: { quantidade: -1 } },
						{ $project: { _id: 0, tipoEvento: '$_id', quantidade: 1 } }
					],
					evolucaoConversao: [
						{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$leadConversionDate' } }, quantidade: { $sum: 1 } } },
						{ $sort: { _id: 1 } },
						{ $project: { _id: 0, data: '$_id', quantidade: 1 } }
					]
				}
			}
		] as any);
		
		// Buscar total de leads ativos e total de leads criados
		const [totalLeadsAtivos, totalLeadsCriados, totalLeadsConvertidos, totalLeadsRejeitados, totalLeadsExpirados] = await Promise.all([
			LeadModel.countDocuments({ userId: 'public', status: { $in: ['pendente', 'em_contato'] } }),
			LeadModel.countDocuments({}), // Todos os leads criados
			LeadModel.countDocuments({ status: 'convertido' }),
			LeadModel.countDocuments({ status: 'rejeitado' }),
			LeadModel.countDocuments({ status: 'expirado' })
		]);

		const data = {
			metricas: {
				totalConvertidos: totalLeadsConvertidos,
				totalLeadsAtivos: totalLeadsAtivos,
				totalLeadsCriados: totalLeadsCriados,
				totalLeadsRejeitados: totalLeadsRejeitados,
				totalLeadsExpirados: totalLeadsExpirados,
				taxaConversao: totalLeadsCriados > 0 ? 
					((totalLeadsConvertidos / totalLeadsCriados) * 100).toFixed(2) : 0,
				leadsPendentes: totalLeadsAtivos,
				leadsProcessados: totalLeadsCriados - totalLeadsAtivos,
				leadsQualificados: totalLeadsConvertidos + totalLeadsAtivos,
				leadsDesqualificados: totalLeadsRejeitados + totalLeadsExpirados
			},
			conversoesPorMes: agg?.conversoesPorMes || [],
			conversoesPorOrigem: agg?.conversoesPorOrigem || [],
			conversoesPorTipoEvento: agg?.conversoesPorTipoEvento || [],
			evolucaoConversao: agg?.evolucaoConversao || []
		};

		res.json(data);
	} catch (error) {
		console.error('Erro ao buscar analytics de conversão:', error);
		res.status(500).json({ message: 'Erro interno do servidor' });
	}
});

export default router; 