import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import clientesRoutes from './routes/clientes';
import eventosRoutes from './routes/eventos';
import fotografosRoutes from './routes/fotografos';
import usersRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import publicRoutes from './routes/public';

const app = express();

const rawOrigins = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawOrigins
	.split(',')
	.map(o => o.trim())
	.filter(Boolean);
const devDefaults = ['http://localhost:3000','http://127.0.0.1:3000','http://[::1]:3000'];
const whitelist = allowedOrigins.length > 0 ? allowedOrigins : (process.env.NODE_ENV === 'production' ? [] : devDefaults);

function sameOrigin(a: string, b: string) {
	try {
		const ua = new URL(a.replace(/\/$/, ''));
		const ub = new URL(b.replace(/\/$/, ''));
		return ua.protocol === ub.protocol && ua.host === ub.host; // compara host:port
	} catch {
		return a.replace(/\/$/, '') === b.replace(/\/$/, '');
	}
}

app.use((req, res, next) => {
	res.header('Vary', 'Origin');
	next();
});

app.use(cors({
	origin: (origin, cb) => {
		if (!origin) return cb(null, true); // curl/SSR/same-origin
		if (whitelist.length === 0) return cb(null, true); // fallback aberto só se nada configurado
		if (whitelist.some(o => sameOrigin(o, origin))) return cb(null, true);
		return cb(new Error('CORS: Origin not allowed'), false);
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/clientes', clientesRoutes);
app.use('/eventos', eventosRoutes);
app.use('/fotografos', fotografosRoutes);
app.use('/users', usersRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/public', publicRoutes);

const PORT = Number(process.env.PORT || 8081);

async function start() {
	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		console.error('MONGODB_URI não configurada');
		process.exit(1);
	}
	await mongoose.connect(mongoUri);
	console.log('Conectado ao MongoDB');
	app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
}

start().catch((err) => {
	console.error('Falha ao iniciar servidor', err);
	process.exit(1);
}); 