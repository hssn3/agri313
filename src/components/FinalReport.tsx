import React, { useMemo } from 'react';
import { AnalysisResult, DesignType, ExperimentalConfig } from '../types';
import { generateFullReport } from '../engine/interpreter';
import { exportToExcel } from '../services/analysisService';
import { DESIGNS } from '../constants';

interface Props {
  designType: DesignType;
  config: ExperimentalConfig;
  result: AnalysisResult;
}

export const FinalReport: React.FC<Props> = ({ designType, config, result }) => {
  const designInfo = DESIGNS.find(d => d.id === designType);

  const reportText = useMemo(() => {
    try {
      return generateFullReport({
        designType,
        designTitle: designInfo?.title || designType,
        config,
        traitStats: result.traitStats,
        anovaResults: result.anovaResults,
        postHocResults: result.postHocResults,
        correlationMatrix: result.correlationMatrix,
        regressionResults: result.regressionResults,
      });
    } catch {
      return 'خطا در تولید گزارش.';
    }
  }, [result, designType, config]);

  const handlePrint = () => window.print();

  const handleExcelExport = async () => {
    try {
      await exportToExcel(result, config, designInfo?.title || designType);
    } catch {
      alert('خطا در خروجی Excel. لطفاً دوباره تلاش کنید.');
    }
  };

  const today = new Date().toLocaleDateString('fa-IR');

  return (
    <div className="space-y-6 print:space-y-4" id="final-report">
      {/* هدر گزارش */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4 print:mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">📄 گزارش جامع آزمایش</h2>
            <p className="text-sm text-slate-500 mt-1">
              نوع طرح: {designInfo?.title} | تاریخ: {today}
              {config.researchTitle && ` | ${config.researchTitle}`}
              {config.researcherName && ` | محقق: ${config.researcherName}`}
            </p>
          </div>
          <div className="flex gap-2 no-print print:hidden">
            <button onClick={handleExcelExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors">
              📊 دانلود Excel
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors">
              🖨️ چاپ / PDF
            </button>
          </div>
        </div>

        {/* خلاصه اجرایی */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="طرح آزمایشی" val={designInfo?.abbreviation || designType} />
          <StatBox label="تعداد تیمار" val={String(config.treatments)} />
          <StatBox label="تعداد تکرار" val={String(config.replications)} />
          <StatBox label="تعداد صفات" val={String(config.traits.length)} />
        </div>
      </div>

      {/* متن گزارش */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm print:rounded-none print:border-0">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {reportText.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-slate-800 dark:text-white mt-4 mb-2">{line.replace('## ', '')}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-base font-black text-slate-700 dark:text-slate-200 mt-4 mb-2 border-r-4 border-blue-500 pr-3">{line.replace('### ', '')}</h3>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">{line}</p>;
          })}
        </div>
      </div>

      {/* جدول خلاصه نتایج */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="font-black text-slate-800 dark:text-white mb-4">خلاصه نتایج برترین تیمارها</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700 text-white text-xs">
              <th className="px-3 py-2 text-right font-bold">صفت</th>
              <th className="px-3 py-2 text-center font-bold">معنی‌داری ANOVA</th>
              <th className="px-3 py-2 text-center font-bold">برترین تیمار</th>
              <th className="px-3 py-2 text-center font-bold">میانگین برتر</th>
              <th className="px-3 py-2 text-center font-bold">CV%</th>
            </tr>
          </thead>
          <tbody>
            {config.traits.map((trait, i) => {
              const a = result.anovaResults[trait];
              const ph = result.postHocResults[trait];
              const s = result.traitStats[trait];
              const treatSrc = a?.sources.find(src => src.source.includes('تیمار') || src.source.includes('Treatment') || src.source.includes('فاکتور اصلی'));
              const sig = treatSrc?.significance || 'ns';
              const best = ph?.groups[0];
              return (
                <tr key={trait} className={`border-b border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                  <td className="px-3 py-2 font-bold text-slate-800 dark:text-white">{trait}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${sig === '**' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : sig === '*' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>{sig}</span>
                  </td>
                  <td className="px-3 py-2 text-center font-bold">{best?.name || '-'}</td>
                  <td className="px-3 py-2 text-center font-mono">{best?.mean.toFixed(4) || '-'}</td>
                  <td className="px-3 py-2 text-center font-mono text-slate-500">{s?.cv.toFixed(2) || '-'}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatBox = ({ label, val }: { label: string; val: string }) => (
  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
    <p className="text-xs text-slate-400 mb-1">{label}</p>
    <p className="font-black text-slate-800 dark:text-white">{val}</p>
  </div>
);
