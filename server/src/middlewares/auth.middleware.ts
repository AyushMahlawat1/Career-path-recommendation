import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'super-secret-career-key-2026-xyz';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: 'STUDENT' | 'ADMIN' };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token is invalid or expired' });
  }
}

export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
  next();
}
