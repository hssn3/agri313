/**
 * routes/auth.ts — Auth endpoints (stub برای آینده)
 */
import { Router, Request, Response } from 'express';

const router = Router();

/** GET /api/auth/status — وضعیت احراز هویت فعلی */
router.get('/status', (_req: Request, res: Response) => {
  // فعلاً حالت آزاد — در آینده از session/JWT بخوان
  res.json({
    success: true,
    data: {
      isAuthenticated: false,
      mode: 'open', // 'open' | 'auth'
      message: 'سیستم در حالت دسترسی آزاد است.',
    },
  });
});

/** POST /api/auth/register — ثبت‌نام (stub) */
router.post('/register', (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    res.status(400).json({ success: false, error: 'اطلاعات ناقص است.' });
    return;
  }
  // TODO: ذخیره در DB
  res.json({ success: true, message: 'ثبت‌نام با موفقیت انجام شد. (stub)' });
});

/** POST /api/auth/login — ورود (stub) */
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'ایمیل و رمز عبور الزامی است.' });
    return;
  }
  // TODO: بررسی DB و تولید JWT
  res.json({
    success: true,
    data: { token: 'stub-token', user: { email, role: 'user' } },
    message: 'ورود موفق. (stub)',
  });
});

/** POST /api/auth/logout */
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'خروج موفق.' });
});

export default router;
