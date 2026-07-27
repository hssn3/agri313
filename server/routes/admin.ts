/**
 * routes/admin.ts — پنل ادمین (stub برای آینده)
 */
import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

// در آینده: اتصال به DB واقعی
const mockUsers = [
  { id: '1', email: 'admin@smartagri.ir', name: 'مدیر سیستم', role: 'admin', isActive: true, tokensUsed: 0, tokensLimit: 999999, createdAt: new Date().toISOString() },
  { id: '2', email: 'test@example.com', name: 'کاربر آزمایشی', role: 'user', isActive: true, tokensUsed: 5, tokensLimit: 100, createdAt: new Date().toISOString() },
];

/** GET /api/admin/users */
router.get('/users', (_req: Request, res: Response) => {
  res.json({ success: true, data: mockUsers });
});

/** GET /api/admin/stats */
router.get('/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.isActive).length,
      totalAnalyses: 0,
      systemVersion: '1.0.0',
    },
  });
});

/** PUT /api/admin/users/:id — ویرایش کاربر */
router.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive, tokensLimit, role } = req.body;
  // TODO: ذخیره در DB
  res.json({ success: true, message: `کاربر ${id} به‌روزرسانی شد. (stub)`, data: { id, isActive, tokensLimit, role } });
});

/** DELETE /api/admin/users/:id */
router.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ success: true, message: `کاربر ${id} حذف شد. (stub)` });
});

export default router;
