import React from 'react';
import { PostHocResult } from '../types';

interface Props { results: Record<string, PostHocResult> }

const METHOD_NAME: Record<string, string> = {
  DUNCAN: 'آزمون دانکن',
  TUKEY: 'آزمون Tukey HSD',
  LSD: 'آزمون LSD',
};

export const MeanComparisonTable: React.FC<Props> = ({ results }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
      🏆 مقایسه میانگین تیمارها
    </h3>
    {Object.values(results).map(ph => (
      <div key={ph.traitName} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="font-black text-slate-800 dark:text-white">صفت: {ph.traitName}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">روش: {METHOD_NAME[ph.method] || ph.method}</span>
            {ph.isSignificant
              ? <span className="px-2 py-0.5 text-xs font-black bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full">معنی‌دار ✓</span>
              : <span className="px-2 py-0.5 text-xs font-black bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full">غیرمعنی‌دار</span>
            }
          </div>
        </div>

        {!ph.isSignificant ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            تیمارها از نظر آماری تفاوت معنی‌داری با یکدیگر ندارند
          </div>
        ) : (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2 px-3 text-right font-bold">رتبه</th>
                  <th className="py-2 px-3 text-right font-bold">تیمار</th>
                  <th className="py-2 px-3 text-center font-bold">میانگین</th>
                  <th className="py-2 px-3 text-center font-bold">گروه‌بندی</th>
                  <th className="py-2 px-3 text-right font-bold">نمودار</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const maxMean = Math.max(...ph.groups.map(g => g.mean));
                  const minMean = Math.min(...ph.groups.map(g => g.mean));
                  const range = maxMean - minMean || 1;
                  return ph.groups.map((g, i) => {
                    const pct = ((g.mean - minMean) / range) * 100;
                    const isTop = i === 0;
                    return (
                      <tr key={g.name} className={`border-b border-slate-50 dark:border-slate-800/50 ${isTop ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                        <td className="py-2 px-3 text-slate-400 text-xs font-mono">{i + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-800 dark:text-white">{g.name}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-200">
                          {g.mean.toFixed(4)}
                          {isTop && <span className="mr-1 text-xs text-green-600 dark:text-green-400">★</span>}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-block min-w-[2rem] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 rounded font-black text-sm uppercase">
                            {g.letter}
                          </span>
                        </td>
                        <td className="py-2 px-3 w-40">
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                              style={{ width: `${Math.max(4, pct)}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-slate-400 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              میانگین‌هایی که حرف مشترک دارند از نظر آماری در سطح ۵٪ تفاوت معنی‌داری ندارند.
              MSE = {ph.mse?.toFixed(4)} | df خطا = {ph.dfE}
            </p>
          </div>
        )}
      </div>
    ))}
  </div>
);
