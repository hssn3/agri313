import React from 'react';
import { DesignInfo } from '../types';
import { DESIGN_COLORS } from '../constants';

interface Props {
  design: DesignInfo;
  onClick: (id: string) => void;
}

export const DesignCard: React.FC<Props> = ({ design, onClick }) => {
  const c = DESIGN_COLORS[design.color] || DESIGN_COLORS.blue;
  return (
    <div
      onClick={() => onClick(design.id)}
      className={`cursor-pointer rounded-3xl border-2 p-6 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${c.bg} ${c.border} group`}
    >
      <div className="flex items-center justify-between">
        <span className="text-4xl">{design.icon}</span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.badge}`}>
          {design.abbreviation}
        </span>
      </div>
      <div>
        <h3 className={`text-lg font-black ${c.text}`}>{design.title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{design.englishTitle}</p>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
        {design.description}
      </p>
      <div className={`text-xs font-bold flex items-center gap-1 ${c.text}`}>
        <span>انتخاب این طرح</span>
        <span className="group-hover:translate-x-[-4px] transition-transform">←</span>
      </div>
    </div>
  );
};
