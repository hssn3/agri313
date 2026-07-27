import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ScatterChart, Scatter, LineChart, Line, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { PostHocResult, CorrelationMatrix, RegressionResult, AnalysisResult } from '../types';

interface Props {
  result: AnalysisResult;
}

const COLORS = ['#2563eb','#16a34a','#9333ea','#ea580c','#0891b2','#dc2626','#65a30d','#d97706'];

export const Visualizations: React.FC<Props> = ({ result }) => {
  const { postHocResults, correlationMatrix, regressionResults } = result;
  const traits = Object.keys(postHocResults);
  const [activeTrait, setActiveTrait] = useState(traits[0] || '');

  const ph = postHocResults[activeTrait];

  const barData = ph?.groups.map(g => ({
    name: g.name,
    mean: g.mean,
    letter: g.letter.toUpperCase(),
  })) || [];

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    return (
      <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#6366f1">
        {barData[index]?.letter}
      </text>
    );
  };

  const CustomTooltipBar = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-sm">
          <p className="font-black text-slate-800 dark:text-white">{d.name}</p>
          <p className="text-blue-600 font-mono">میانگین: {d.mean.toFixed(4)}</p>
          <p className="text-indigo-600">گروه: {d.letter}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-black text-slate-800 dark:text-white">📈 نمودارها و تصویرسازی</h3>

      {/* انتخاب صفت */}
      {traits.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {traits.map(t => (
            <button key={t} onClick={() => setActiveTrait(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${activeTrait === t ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* نمودار میله‌ای */}
      {ph && ph.groups.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 text-sm">میانگین تیمارها — {activeTrait}</h4>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} margin={{ top: 30, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold' }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="mean" radius={[6, 6, 0, 0]} label={<CustomBarLabel />}>
                {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ماتریس همبستگی بصری */}
      {correlationMatrix && correlationMatrix.traits.length > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 text-sm">ماتریس همبستگی پیرسون</h4>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse mx-auto">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {correlationMatrix.traits.map(t => (
                    <th key={t} className="p-2 text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.traits.map(t1 => (
                  <tr key={t1}>
                    <td className="p-2 text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{t1}</td>
                    {correlationMatrix.traits.map(t2 => {
                      const cell = correlationMatrix.matrix[t1]?.[t2];
                      const r = cell?.r ?? 0;
                      const sig = cell?.significance ?? 'ns';
                      const intensity = Math.abs(r);
                      const bg = t1 === t2 ? '#e2e8f0'
                        : r > 0 ? `rgba(37,99,235,${intensity * 0.7})`
                        : `rgba(220,38,38,${intensity * 0.7})`;
                      const textColor = intensity > 0.4 ? 'white' : 'inherit';
                      return (
                        <td key={t2} style={{ backgroundColor: bg, color: textColor }}
                          className="p-2 text-center font-mono text-xs rounded min-w-[70px] border border-white dark:border-slate-900">
                          {t1 === t2 ? '1.0000' : r.toFixed(4)}
                          {sig !== 'ns' && <sup className="font-black">{sig}</sup>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">آبی = همبستگی مثبت | قرمز = همبستگی منفی | ** p&lt;0.01 | * p&lt;0.05</p>
        </div>
      )}

      {/* نمودار رگرسیون */}
      {regressionResults && regressionResults.length > 0 && regressionResults[0] && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-1 text-sm">خط رگرسیون</h4>
          <p className="text-xs text-slate-500 mb-4 font-mono">{regressionResults[0].equation} | R² = {regressionResults[0].rSquare.toFixed(4)}</p>
          <div className="text-sm text-slate-500 italic text-center py-4">
            (نمودار scatter برای رگرسیون در صورت ورود داده‌های کامل نمایش داده می‌شود)
          </div>
        </div>
      )}
    </div>
  );
};
