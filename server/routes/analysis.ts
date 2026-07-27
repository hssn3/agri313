/**
 * routes/analysis.ts — اندپوینت‌های کمکی
 * محاسبات اصلی client-side انجام می‌شود (localEngine.ts)
 * این route فقط parse CSV را پشتیبانی می‌کند
 */
import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /api/analysis/parse-csv
 * Body: { csv: string }
 * Returns: { rows, headers }
 */
router.post('/parse-csv', (req: Request, res: Response) => {
  try {
    const { csv, traits } = req.body;
    if (!csv) { res.status(400).json({ success: false, error: 'داده CSV ارسال نشده.' }); return; }

    const lines = (csv as string).trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
    if (lines.length < 2) { res.status(400).json({ success: false, error: 'فایل CSV خالی است.' }); return; }

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map((line: string, idx: number) => {
      const cols = line.split(',').map((c: string) => c.trim().replace(/"/g, ''));
      const values: Record<string, string> = {};
      headers.forEach((h: string, i: number) => {
        const lower = h.toLowerCase();
        if (!['rep', 'treatment', 'row', 'col', 'factora', 'factorb'].includes(lower)) {
          values[h] = cols[i] ?? '';
        }
      });
      const get = (key: string) => {
        const i = headers.findIndex((h: string) => h.toLowerCase() === key);
        return i >= 0 ? cols[i] : undefined;
      };
      return {
        id: `row_${idx}`,
        rep: parseInt(get('rep') ?? '1') || 1,
        treatment: get('treatment') ?? `T${idx + 1}`,
        row: parseInt(get('row') ?? '0') || undefined,
        col: parseInt(get('col') ?? '0') || undefined,
        factorA: parseInt(get('factora') ?? '0') || undefined,
        factorB: parseInt(get('factorb') ?? '0') || undefined,
        values,
      };
    });

    res.json({ success: true, data: { rows, headers } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
