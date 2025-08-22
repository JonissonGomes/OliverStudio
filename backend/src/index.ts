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
import dashboardRoutes from './routes/dashboard';
import leadsRoutes from './routes/leads';
import publicRoutes from './routes/public';

const app = express();

// Configuração CORS simplificada - permite todas as origens
app.use(cors({
	origin: true, // Permite todas as origens
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	exposedHeaders: ['Content-Length', 'X-Total-Count']
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
app.use('/dashboard', dashboardRoutes);
app.use('/leads', leadsRoutes);
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