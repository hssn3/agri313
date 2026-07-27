import React from 'react';
import { AnovaResult } from '../types';

interface Props { results: Record<string, AnovaResult> }

const SIG_BADGE: Record<string, string> = {
  '**': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  '*':  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  'ns': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const AnovaTable: React.FC<Props> = ({ results }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
      📊 جدول تجزیه واریانس (ANOVA)
    </h3>
    {Object.values(results).map(res => (
      <div key={res.traitName} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <span className="font-black text-slate-800 dark:text-white">صفت: {res.traitName}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 text-white text-xs">
                {['منبع تغییرات','df','SS','MS','F محاسبه','F جدول ۵٪','F جدول ۱٪','معنی‌داری','p-value'].map(h => (
                  <th key={h} className="px-4 py-2 text-right font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {res.sources.map((s, i) => {
                const isTotal = s.source.includes('کل');
                const isError = s.source.includes('خطا') || s.source.toLowerCase().includes('error');
                return (
                  <tr key={i} className={`border-b border-slate-100 dark:border-slate-800 ${isTotal ? 'bg-slate-50 dark:bg-slate-800/50 font-bold' : isError ? 'bg-orange-50/30 dark:bg-orange-900/5' : 'bg-white dark:bg-slate-900'}`}>
                    <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{s.source}</td>
                    <td className="px-4 py-2 text-center font-mono">{s.df}</td>
                    <td className="px-4 py-2 text-center font-mono">{s.ss.toFixed(4)}</td>
                    <td className="px-4 py-2 text-center font-mono">{s.ms > 0 ? s.ms.toFixed(4) : '-'}</td>
                    <td className="px-4 py-2 text-center font-mono font-bold">{s.fCalc > 0 ? s.fCalc.toFixed(3) : '-'}</td>
                    <td className="px-4 py-2 text-center font-mono text-slate-500">{s.fTab05 > 0 ? s.fTab05.toFixed(3) : '-'}</td>
                    <td className="px-4 py-2 text-center font-mono text-slate-500">{s.fTab01 > 0 ? s.fTab01.toFixed(3) : '-'}</td>
                    <td className="px-4 py-2 text-center">
                      {s.fCalc > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${SIG_BADGE[s.significance]}`}>
                          {s.significance}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center font-mono text-slate-500 text-xs">
                      {s.pValue > 0 && s.pValue < 1 ? s.pValue.toFixed(4) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 flex gap-4">
          <span><span className="font-black text-green-700 dark:text-green-400">**</span> معنی‌دار در ۱٪</span>
          <span><span className="font-black text-yellow-700 dark:text-yellow-400">*</span> معنی‌دار در ۵٪</span>
          <span><span className="font-black text-slate-500">ns</span> غیرمعنی‌دار</span>
        </div>
      </div>
    ))}
  </div>
);
