/**
 * middleware/auth.ts
 * Auth middleware — فعلاً stub، در آینده JWT-based
 */

import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: 'admin' | 'user' };
}

/** فعلاً همه درخواست‌ها مجاز هستند — آینده: JWT verify */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  // TODO: در آینده JWT token از header بخوان و verify کن
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  // TODO: در آینده بررسی role === 'admin'
  next();
}
