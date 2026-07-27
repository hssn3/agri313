/**
 * routes/analysis.ts — اندپوینت‌های محاسبات آماری
 * همه محاسبات server-side انجام می‌شود
 */
import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /api/analysis/run
 * Body: { data, traits, designType, config, method }
 * Returns: { traitStats, anovaResults, postHocResults, correlationMatrix, regressionResults }
 */
router.post('/run', async (req: Request, res: Response) => {
  try {
    const { data, traits, designType, config, method = 'DUNCAN' } = req.body;

    if (!data || !traits || !designType || !config) {
      res.status(400).json({ success: false, error: 'پارامترهای ناقص.' });
      return;
    }

    // Dynamic import برای ESM compatibility
    const { StatsEngine } = await import('../../src/engine/statsEngine.js');

    const traitStats = StatsEngine.calculateStats(data, traits);

    let anovaResults: Record<string, unknown> = {};
    if (designType === 'CRD') anovaResults = StatsEngine.crdAnova(data, traits);
    else if (designType === 'RCBD') anovaResults = StatsEngine.rcbdAnova(data, traits, config);
    else if (designType === 'LSD') anovaResults = StatsEngine.lsdAnova(data, traits, config);
    else if (designType === 'FACTORIAL') anovaResults = StatsEngine.factorialAnova(data, traits, config);
    else if (designType === 'SPLIT_PLOT') anovaResults = StatsEngine.splitPlotAnova(data, traits, config);

    const postHocResults: Record<string, unknown> = {};
    traits.forEach((trait: string) => {
      if (anovaResults[trait]) {
        postHocResults[trait] = StatsEngine.postHoc(
          data, trait, anovaResults[trait] as any, method, config
        );
      }
    });

    let correlationMatrix = null;
    let regressionResults = null;
    if (traits.length > 1) {
      correlationMatrix = StatsEngine.correlationMatrix(data, traits);
      regressionResults = [];
      for (let i = 0; i < traits.length; i++) {
        for (let j = i + 1; j < traits.length; j++) {
          regressionResults.push(StatsEngine.regression(data, traits[i], traits[j]));
        }
      }
    }

    res.json({
      success: true,
      data: { traitStats, anovaResults, postHocResults, correlationMatrix, regressionResults },
    });
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({ success: false, error: err.message || 'خطا در پردازش.' });
  }
});

/**
 * POST /api/analysis/parse-csv
 * Body: { csv: string, designType, config }
 * Returns: { data: DataRow[] }
 */
router.post('/parse-csv', (req: Request, res: Response) => {
  try {
    const { csv, traits } = req.body;
    if (!csv) { res.status(400).json({ success: false, error: 'داده CSV ارسال نشده.' }); return; }

    const lines = csv.trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
    if (lines.length < 2) { res.status(400).json({ success: false, error: 'فایل CSV خالی است.' }); return; }

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map((line: string, idx: number) => {
      const cols = line.split(',').map((c: string) => c.trim().replace(/"/g, ''));
      const values: Record<string, string> = {};
      headers.forEach((h: string, i: number) => {
        if (!['rep', 'treatment', 'row', 'col', 'factorA', 'factorB'].includes(h.toLowerCase())) {
          values[h] = cols[i] || '';
        }
      });
      return {
        id: `row_${idx}`,
        rep: parseInt(cols[headers.indexOf('rep')] || cols[headers.indexOf('Rep')] || '1'),
        treatment: cols[headers.indexOf('treatment')] || cols[headers.indexOf('Treatment')] || `T${idx + 1}`,
        row: parseInt(cols[headers.indexOf('row')] || cols[headers.indexOf('Row')] || '0') || undefined,
        col: parseInt(cols[headers.indexOf('col')] || cols[headers.indexOf('Col')] || '0') || undefined,
        factorA: parseInt(cols[headers.indexOf('factorA')] || '0') || undefined,
        factorB: parseInt(cols[headers.indexOf('factorB')] || '0') || undefined,
        values,
      };
    });

    res.json({ success: true, data: { rows, headers } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
