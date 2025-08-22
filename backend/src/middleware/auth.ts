import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
		roles: string[];
		fullName?: string;
	};
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const token = authHeader.substring('Bearer '.length);
	try {
		const secret = process.env.JWT_SECRET;
		if (!secret) {
			return res.status(500).json({ message: 'JWT secret not configured' });
		}
		const payload = jwt.verify(token, secret) as any;
		req.user = {
			id: payload.sub,
			email: payload.email,
			roles: payload.roles || [],
			fullName: payload.fullName,
		};
		return next();
	} catch {
		return res.status(401).json({ message: 'Invalid token' });
	}
}; 