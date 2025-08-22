import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const requireRole = (requiredRoles: string[]) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user || !req.user.roles) {
			return res.status(403).json({ message: 'Acesso negado' });
		}

		const hasRequiredRole = req.user.roles.some(role => requiredRoles.includes(role));
		
		if (!hasRequiredRole) {
			return res.status(403).json({ 
				message: `Acesso negado. Roles necessários: ${requiredRoles.join(', ')}` 
			});
		}

		next();
	};
}; 