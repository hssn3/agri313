import React from 'react';
import { TraitStats } from '../types';

interface Props {
  stats: Record<string, TraitStats>;
  onTransform: (trait: string, type: 'log' | 'sqrt' | 'arcsin') => void;
}

export const DescriptiveStats: React.FC<Props> = ({ stats, onTransform }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-black text-slate-800 dark:text-white">📋 آمار توصیفی و سلامت داده‌ها</h3>
    {Object.values(stats).map(s => (
      <div key={s.traitName} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-800 dark:text-white text-base">صفت: {s.traitName}</span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${s.cv < 20 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'}`}>
              CV = {s.cv.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            {s.isNormal
              ? <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">✅ توزیع نرمال (p={s.swPValue.toFixed(3)})</span>
              : <span className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">⚠️ غیرنرمال (p={s.swPValue.toFixed(3)})</span>
            }
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
          {[
            { label: 'n', val: s.n, mono: false },
            { label: 'میانگین', val: s.mean.toFixed(4), mono: true },
            { label: 'انحراف معیار', val: s.stdDev.toFixed(4), mono: true },
            { label: 'واریانس', val: s.variance.toFixed(4), mono: true },
            { label: 'حداقل', val: s.min.toFixed(4), mono: true },
            { label: 'حداکثر', val: s.max.toFixed(4), mono: true },
            { label: 'چولگی', val: s.skewness.toFixed(3), mono: true },
            { label: 'W (Shapiro)', val: s.swW.toFixed(4), mono: true },
          ].map(({ label, val, mono }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2 text-center">
              <p className="text-[10px] text-slate-400 mb-1">{label}</p>
              <p className={`font-black text-slate-800 dark:text-white text-sm ${mono ? 'font-mono' : ''}`}>{val}</p>
            </div>
          ))}
        </div>

        {!s.isNormal && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-bold">تبدیل داده برای نرمال‌سازی:</span>
            {(['log', 'sqrt', 'arcsin'] as const).map(type => (
              <button key={type} onClick={() => onTransform(s.traitName, type)}
                className="px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-colors">
                {type === 'log' ? 'لگاریتمی Log₁₀' : type === 'sqrt' ? 'ریشه دوم √' : 'آرک‌سینوس Sin⁻¹'}
              </button>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);
