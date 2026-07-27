/**
 * routes/export.ts — export به Excel و ارائه نمونه
 */
import { Router, Request, Response } from 'express';
import ExcelJS from 'exceljs';

const router = Router();

/**
 * POST /api/export/excel
 * Body: { analysisResult, config, designTitle }
 * Returns: Excel file
 */
router.post('/excel', async (req: Request, res: Response) => {
  try {
    const { analysisResult, config, designTitle } = req.body;
    if (!analysisResult) { res.status(400).json({ success: false, error: 'داده‌ای ارسال نشده.' }); return; }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'SmartAgri';
    wb.created = new Date();

    // ── Sheet 1: آمار توصیفی ──────────────────────────────
    const ws1 = wb.addWorksheet('آمار توصیفی');
    ws1.views = [{ rightToLeft: true }];
    ws1.columns = [
      { header: 'صفت', key: 'trait', width: 20 },
      { header: 'تعداد', key: 'n', width: 8 },
      { header: 'میانگین', key: 'mean', width: 14 },
      { header: 'انحراف معیار', key: 'sd', width: 14 },
      { header: 'واریانس', key: 'var', width: 14 },
      { header: 'CV%', key: 'cv', width: 10 },
      { header: 'حداقل', key: 'min', width: 12 },
      { header: 'حداکثر', key: 'max', width: 12 },
      { header: 'چولگی', key: 'skew', width: 10 },
      { header: 'W (Shapiro)', key: 'sw', width: 14 },
      { header: 'p-value (SW)', key: 'swp', width: 14 },
      { header: 'نرمال؟', key: 'norm', width: 10 },
    ];
    styleHeader(ws1);

    Object.values(analysisResult.traitStats || {}).forEach((s: any) => {
      ws1.addRow({
        trait: s.traitName, n: s.n,
        mean: round4(s.mean), sd: round4(s.stdDev), var: round4(s.variance),
        cv: round2(s.cv), min: round4(s.min), max: round4(s.max),
        skew: round4(s.skewness), sw: round4(s.swW), swp: round4(s.swPValue),
        norm: s.isNormal ? 'بله' : 'خیر',
      });
    });

    // ── Sheet 2: ANOVA ────────────────────────────────────
    const ws2 = wb.addWorksheet('تجزیه واریانس (ANOVA)');
    ws2.views = [{ rightToLeft: true }];
    ws2.columns = [
      { header: 'صفت', key: 'trait', width: 20 },
      { header: 'منبع تغییرات', key: 'source', width: 28 },
      { header: 'df', key: 'df', width: 6 },
      { header: 'SS', key: 'ss', width: 14 },
      { header: 'MS', key: 'ms', width: 14 },
      { header: 'F محاسبه', key: 'fc', width: 12 },
      { header: 'F جدول 5%', key: 'f05', width: 12 },
      { header: 'F جدول 1%', key: 'f01', width: 12 },
      { header: 'معنی‌داری', key: 'sig', width: 12 },
    ];
    styleHeader(ws2);

    Object.values(analysisResult.anovaResults || {}).forEach((a: any) => {
      a.sources.forEach((s: any) => {
        ws2.addRow({
          trait: a.traitName, source: s.source, df: s.df,
          ss: round4(s.ss), ms: round4(s.ms), fc: round4(s.fCalc),
          f05: round4(s.fTab05), f01: round4(s.fTab01), sig: s.significance,
        });
      });
      ws2.addRow({});
    });

    // ── Sheet 3: مقایسه میانگین ───────────────────────────
    const ws3 = wb.addWorksheet('مقایسه میانگین');
    ws3.views = [{ rightToLeft: true }];
    ws3.columns = [
      { header: 'صفت', key: 'trait', width: 20 },
      { header: 'تیمار', key: 'name', width: 18 },
      { header: 'میانگین', key: 'mean', width: 14 },
      { header: 'گروه‌بندی', key: 'letter', width: 12 },
    ];
    styleHeader(ws3);

    Object.values(analysisResult.postHocResults || {}).forEach((ph: any) => {
      ph.groups.forEach((g: any) => {
        ws3.addRow({ trait: ph.traitName, name: g.name, mean: round4(g.mean), letter: g.letter.toUpperCase() });
      });
      ws3.addRow({});
    });

    // ── Sheet 4: همبستگی ──────────────────────────────────
    if (analysisResult.correlationMatrix) {
      const ws4 = wb.addWorksheet('ماتریس همبستگی');
      ws4.views = [{ rightToLeft: true }];
      const traits = analysisResult.correlationMatrix.traits as string[];
      ws4.addRow(['', ...traits]);
      traits.forEach((t1: string) => {
        const row: (string | number)[] = [t1];
        traits.forEach((t2: string) => {
          const cell = analysisResult.correlationMatrix.matrix[t1]?.[t2];
          row.push(cell ? `${round4(cell.r)} ${cell.significance}` : '-');
        });
        ws4.addRow(row);
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="smartagri-results.xlsx"');
    await wb.xlsx.write(res);
  } catch (err: any) {
    console.error('Excel export error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/export/sample/:designType
 * دانلود فایل نمونه Excel برای هر طرح
 */
router.get('/sample/:designType', async (req: Request, res: Response) => {
  const { designType } = req.params;
  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'SmartAgri Sample';
    const ws = wb.addWorksheet('Data');
    ws.views = [{ rightToLeft: false }];

    const samples: Record<string, { cols: string[]; rows: (string | number)[][] }> = {
      CRD: {
        cols: ['rep', 'treatment', 'Yield', 'PlantHeight'],
        rows: [
          [1,'T1',45.2,88],[1,'T2',38.7,75],[1,'T3',52.1,95],[1,'T4',41.3,82],
          [2,'T1',43.8,85],[2,'T2',40.1,78],[2,'T3',50.4,92],[2,'T4',39.8,80],
          [3,'T1',46.5,90],[3,'T2',37.9,73],[3,'T3',53.6,97],[3,'T4',42.0,84],
        ],
      },
      RCBD: {
        cols: ['rep', 'treatment', 'Yield', 'GrainWeight'],
        rows: [
          [1,'T1',32.4,28.5],[1,'T2',28.9,25.1],[1,'T3',35.8,31.2],[1,'T4',30.1,26.8],
          [2,'T1',33.1,29.0],[2,'T2',27.5,24.3],[2,'T3',36.4,32.0],[2,'T4',31.2,27.5],
          [3,'T1',31.8,28.1],[3,'T2',29.2,25.8],[3,'T3',34.9,30.5],[3,'T4',29.7,26.2],
        ],
      },
      LSD: {
        cols: ['row', 'col', 'treatment', 'Yield'],
        rows: [
          [1,1,'A',45],[1,2,'B',38],[1,3,'C',52],[1,4,'D',41],
          [2,1,'C',50],[2,2,'D',40],[2,3,'A',47],[2,4,'B',36],
          [3,1,'B',37],[3,2,'A',44],[3,3,'D',42],[3,4,'C',53],
          [4,1,'D',43],[4,2,'C',51],[4,3,'B',39],[4,4,'A',46],
        ],
      },
      FACTORIAL: {
        cols: ['rep', 'factorA', 'factorB', 'treatment', 'Yield', 'BioMass'],
        rows: [
          [1,1,1,'A1B1',42.3,185],[1,1,2,'A1B2',45.8,192],[1,2,1,'A2B1',38.9,175],[1,2,2,'A2B2',51.2,210],
          [2,1,1,'A1B1',43.7,188],[2,1,2,'A1B2',44.2,190],[2,2,1,'A2B1',40.1,178],[2,2,2,'A2B2',49.8,205],
          [3,1,1,'A1B1',41.5,183],[3,1,2,'A1B2',46.3,195],[3,2,1,'A2B1',39.4,172],[3,2,2,'A2B2',52.1,214],
        ],
      },
      SPLIT_PLOT: {
        cols: ['rep', 'factorA', 'factorB', 'treatment', 'Yield', 'Protein'],
        rows: [
          [1,1,1,'A1B1',55.2,12.3],[1,1,2,'A1B2',58.7,13.1],[1,1,3,'A1B3',52.4,11.8],
          [1,2,1,'A2B1',62.1,14.2],[1,2,2,'A2B2',65.8,15.0],[1,2,3,'A2B3',59.3,13.5],
          [2,1,1,'A1B1',54.8,12.1],[2,1,2,'A1B2',59.2,13.3],[2,1,3,'A1B3',53.1,11.9],
          [2,2,1,'A2B1',63.4,14.5],[2,2,2,'A2B2',64.2,14.8],[2,2,3,'A2B3',60.1,13.8],
          [3,1,1,'A1B1',56.1,12.5],[3,1,2,'A1B2',57.9,12.9],[3,1,3,'A1B3',51.8,11.6],
          [3,2,1,'A2B1',61.5,14.0],[3,2,2,'A2B2',66.3,15.2],[3,2,3,'A2B3',58.7,13.2],
        ],
      },
    };

    const sample = samples[designType.toUpperCase()] || samples['CRD'];
    ws.addRow(sample.cols);
    sample.rows.forEach(r => ws.addRow(r));

    // استایل header
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };

    // راهنما در sheet جداگانه
    const wsGuide = wb.addWorksheet('راهنما');
    wsGuide.views = [{ rightToLeft: true }];
    wsGuide.addRow(['راهنمای پر کردن جدول داده‌ها']);
    wsGuide.addRow(['']);
    wsGuide.addRow(['ستون‌های اجباری:']);
    wsGuide.addRow(['rep', 'شماره تکرار (عدد صحیح از 1)']);
    wsGuide.addRow(['treatment', 'نام یا کد تیمار']);
    wsGuide.addRow(['صفات', 'هر ستون یک صفت — نام ستون = نام صفت']);
    wsGuide.addRow(['']);
    wsGuide.addRow(['نکات مهم:']);
    wsGuide.addRow(['- اعداد اعشاری با نقطه (.) وارد شوند']);
    wsGuide.addRow(['- سلول‌های خالی قابل قبول نیستند']);
    wsGuide.addRow(['- برای طرح LSD: ستون‌های row و col اضافه کنید']);
    wsGuide.addRow(['- برای طرح فاکتوریل: ستون‌های factorA و factorB اضافه کنید']);
    wsGuide.getRow(1).font = { bold: true, size: 14 };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="sample-${designType}.xlsx"`);
    await wb.xlsx.write(res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helpers
function styleHeader(ws: ExcelJS.Worksheet) {
  const row = ws.getRow(1);
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
  row.alignment = { horizontal: 'center', vertical: 'middle' };
  row.height = 22;
}
function round4(n: number) { return isNaN(n) ? 0 : Math.round(n * 10000) / 10000; }
function round2(n: number) { return isNaN(n) ? 0 : Math.round(n * 100) / 100; }

export default router;
