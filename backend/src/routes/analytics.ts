import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { EventoModel } from '../models/Evento';

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

router.get('/summary', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const parse = querySchema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ message: 'Invalid query', errors: parse.error.issues });
  const { from, to, city } = parse.data;

  const key = cacheKey(req.user!.id, from, to, city);
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(hit.data);
  }

  const match: any = { userId: req.user!.id };
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

  cache.set(key, { data, expiresAt: now + TTL_MS });
  res.setHeader('X-Cache', 'MISS');
  res.setHeader('Cache-Control', 'private, max-age=30');
  return res.json(data);
});

export default router; 