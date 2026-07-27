import React, { useState, useRef, useCallback } from 'react';
import { DataRow, ExperimentalConfig, DesignType } from '../types';
import { parseCSV } from '../services/analysisService';
import { getSampleData } from '../services/sampleData';

interface Props {
  designType: DesignType;
  config: ExperimentalConfig;
  onBack: () => void;
  onStartAnalysis: (data: DataRow[]) => void;
}

function generateRows(designType: DesignType, config: ExperimentalConfig): DataRow[] {
  const rows: DataRow[] = [];
  const emptyVals = () => Object.fromEntries(config.traits.map(t => [t, '']));
  let idx = 0;

  if (designType === DesignType.CRD) {
    for (let r = 1; r <= config.replications; r++)
      for (let t = 1; t <= config.treatments; t++)
        rows.push({ id: `r${++idx}`, rep: r, treatment: `T${t}`, values: emptyVals() });
  } else if (designType === DesignType.RCBD) {
    for (let r = 1; r <= config.replications; r++)
      for (let t = 1; t <= config.treatments; t++)
        rows.push({ id: `r${++idx}`, rep: r, treatment: `T${t}`, values: emptyVals() });
  } else if (designType === DesignType.LSD) {
    const n = config.treatments;
    // ساخت مربع لاتین استاندارد
    for (let row = 1; row <= n; row++)
      for (let col = 1; col <= n; col++) {
        const tIdx = ((row + col - 2) % n);
        const letter = String.fromCharCode(65 + tIdx);
        rows.push({ id: `r${++idx}`, rep: row, treatment: letter, row, col, values: emptyVals() });
      }
  } else if (designType === DesignType.FACTORIAL) {
    const a = config.factors?.factorA ?? 2, b = config.factors?.factorB ?? 2;
    for (let r = 1; r <= config.replications; r++)
      for (let fa = 1; fa <= a; fa++)
        for (let fb = 1; fb <= b; fb++) {
          const lA = config.factors?.labelA || 'A', lB = config.factors?.labelB || 'B';
          rows.push({ id: `r${++idx}`, rep: r, treatment: `${lA}${fa}${lB}${fb}`, factorA: fa, factorB: fb, values: emptyVals() });
        }
  } else if (designType === DesignType.SPLIT_PLOT) {
    const a = config.plots?.mainPlots ?? 2, b = config.plots?.subPlots ?? 2;
    for (let r = 1; r <= config.replications; r++)
      for (let fa = 1; fa <= a; fa++)
        for (let fb = 1; fb <= b; fb++) {
          const lA = config.plots?.labelMain || 'M', lB = config.plots?.labelSub || 'S';
          rows.push({ id: `r${++idx}`, rep: r, treatment: `${lA}${fa}${lB}${fb}`, factorA: fa, factorB: fb, mainPlot: fa, subPlot: fb, values: emptyVals() });
        }
  }
  return rows;
}

export const DataTable: React.FC<Props> = ({ designType, config, onBack, onStartAnalysis }) => {
  const [rows, setRows] = useState<DataRow[]>(() => generateRows(designType, config));
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [showSampleInfo, setShowSampleInfo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadSampleData = () => {
    const sample = getSampleData(designType);
    if (!sample) return;
    // بارگذاری داده‌های نمونه — فقط ردیف‌هایی که trait‌هایشان با config مطابق دارد
    const mappedRows: DataRow[] = sample.data.map(r => ({
      ...r,
      values: Object.fromEntries(
        config.traits.map(t => [t, r.values[t] ?? r.values[Object.keys(r.values)[config.traits.indexOf(t)]] ?? ''])
      ),
    }));
    setRows(mappedRows);
    setShowSampleInfo(true);
    setTimeout(() => setShowSampleInfo(false), 4000);
  };

  const updateCell = useCallback((id: string, trait: string, val: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, values: { ...r.values, [trait]: val } } : r));
  }, []);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setImportError('');
    try {
      const text = await file.text();
      let csv = text;
      // اگر xlsx باشه باید XLSX کتابخانه parse کنه - فعلاً CSV
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setImportError('فایل Excel مستقیماً قابل import نیست. لطفاً فایل را به CSV تبدیل کنید یا از جدول زیر استفاده کنید.');
        setImporting(false); return;
      }
      const result = await parseCSV(csv, config.traits);
      // map به DataRow
      const mapped: DataRow[] = result.rows.map((r: any, i: number) => ({
        ...r,
        id: `imported_${i}`,
        values: Object.fromEntries(config.traits.map(t => [t, r.values[t] ?? r.values[t.toLowerCase()] ?? ''])),
      }));
      setRows(mapped);
    } catch (err: any) {
      // fallback: parse CSV در client
      try {
        const text = await file.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const parsed: DataRow[] = lines.slice(1).map((line, i) => {
          const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
          const vals: Record<string, string> = {};
          config.traits.forEach(t => {
            const idx = headers.findIndex(h => h.toLowerCase() === t.toLowerCase());
            vals[t] = idx >= 0 ? cols[idx] : '';
          });
          return {
            id: `csv_${i}`,
            rep: parseInt(cols[headers.findIndex(h => h.toLowerCase() === 'rep')] || '1'),
            treatment: cols[headers.findIndex(h => h.toLowerCase() === 'treatment')] || `T${i + 1}`,
            row: parseInt(cols[headers.findIndex(h => h.toLowerCase() === 'row')] || '0') || undefined,
            col: parseInt(cols[headers.findIndex(h => h.toLowerCase() === 'col')] || '0') || undefined,
            factorA: parseInt(cols[headers.findIndex(h => h.toLowerCase() === 'factora')] || '0') || undefined,
            factorB: parseInt(cols[headers.findIndex(h => h.toLowerCase() === 'factorb')] || '0') || undefined,
            values: vals,
          };
        });
        setRows(parsed);
      } catch {
        setImportError('خطا در خواندن فایل: ' + err.message);
      }
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const validate = () => {
    const empty = rows.some(r => config.traits.some(t => r.values[t].trim() === '' || isNaN(parseFloat(r.values[t]))));
    if (empty) return confirm('برخی سلول‌ها خالی یا غیرعددی هستند. آیا می‌خواهید ادامه دهید؟');
    return true;
  };

  const handleAnalysis = () => {
    if (validate()) onStartAnalysis(rows);
  };

  const showLSD = designType === DesignType.LSD;
  const showFactors = designType === DesignType.FACTORIAL || designType === DesignType.SPLIT_PLOT;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">←</button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">ورود داده‌ها</h2>
            <p className="text-sm text-slate-500">{rows.length} مشاهده | {config.traits.length} صفت</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileImport} />
          <button onClick={() => fileRef.current?.click()}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1">
            {importing ? '⏳' : '📂'} Import CSV
          </button>
          <button onClick={loadSampleData}
            className="px-4 py-2 border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1">
            🎲 تولید داده نمونه
          </button>
          <button onClick={handleAnalysis}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-black shadow-lg hover:scale-[1.02] transition-transform">
            شروع تحلیل ▶
          </button>
        </div>
      </div>

      {importError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
          ⚠️ {importError}
        </div>
      )}

      {showSampleInfo && (() => {
        const s = getSampleData(designType);
        return s ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <span className="text-lg">✅</span>
            <div>
              <p className="font-bold">{s.title}</p>
              <p className="text-xs mt-0.5">{s.description}</p>
              <p className="text-xs mt-0.5 opacity-70">منبع: {s.source}</p>
            </div>
          </div>
        ) : null;
      })()}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800 dark:bg-slate-900 text-white">
              <th className="px-3 py-2 text-right font-bold whitespace-nowrap">تکرار</th>
              {showLSD && <><th className="px-3 py-2 text-right font-bold">ردیف</th><th className="px-3 py-2 text-right font-bold">ستون</th></>}
              {showFactors && <><th className="px-3 py-2 text-right font-bold">فاکتور A</th><th className="px-3 py-2 text-right font-bold">فاکتور B</th></>}
              <th className="px-3 py-2 text-right font-bold whitespace-nowrap">تیمار</th>
              {config.traits.map(t => (
                <th key={t} className="px-3 py-2 text-center font-bold whitespace-nowrap min-w-[100px]">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className={`border-b border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                <td className="px-3 py-1 text-center font-mono text-slate-500">{row.rep}</td>
                {showLSD && <><td className="px-3 py-1 text-center font-mono text-slate-500">{row.row}</td><td className="px-3 py-1 text-center font-mono text-slate-500">{row.col}</td></>}
                {showFactors && <><td className="px-3 py-1 text-center font-mono text-slate-500">{row.factorA}</td><td className="px-3 py-1 text-center font-mono text-slate-500">{row.factorB}</td></>}
                <td className="px-3 py-1 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.treatment}</td>
                {config.traits.map(trait => (
                  <td key={trait} className="px-1 py-1">
                    <input
                      type="number"
                      step="any"
                      value={row.values[trait]}
                      onChange={e => updateCell(row.id, trait, e.target.value)}
                      className="w-full px-2 py-1 text-center font-mono text-slate-800 dark:text-white bg-transparent border border-transparent hover:border-blue-300 dark:hover:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg outline-none transition-colors"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 text-center">برای ناوبری بین سلول‌ها از کلید Tab استفاده کنید</p>
    </div>
  );
};
