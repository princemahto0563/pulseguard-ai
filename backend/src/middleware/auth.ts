import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 JWT_SECRET is required in production and was not provided.');
      throw new Error('JWT_SECRET must be defined in production environment variables.');
    }
    console.warn('⚠️ JWT_SECRET is not configured. Using a local development fallback secret.');
    return 'dev-super-secret-pulseguard-token-key-12345';
  }
  return secret;
};

export const authenticateToken = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
};
