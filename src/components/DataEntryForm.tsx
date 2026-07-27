import React, { useState } from 'react';
import { DesignType, ExperimentalConfig } from '../types';
import { getSampleUrl } from '../services/analysisService';

interface Props {
  designType: DesignType;
  onBack: () => void;
  onSubmit: (config: ExperimentalConfig) => void;
}

export const DataEntryForm: React.FC<Props> = ({ designType, onBack, onSubmit }) => {
  const [treatments, setTreatments] = useState(designType === DesignType.LSD ? 4 : 3);
  const [replications, setReplications] = useState(3);
  const [traitInput, setTraitInput] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [factorA, setFactorA] = useState(2);
  const [factorB, setFactorB] = useState(3);
  const [labelA, setLabelA] = useState('');
  const [labelB, setLabelB] = useState('');
  const [researchTitle, setResearchTitle] = useState('');
  const [researcherName, setResearcherName] = useState('');

  const addTrait = () => {
    const t = traitInput.trim();
    if (t && !traits.includes(t)) { setTraits([...traits, t]); setTraitInput(''); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (traits.length === 0) { alert('حداقل یک صفت تعریف کنید.\nمثال: Yield یا عملکرد، PlantHeight یا ارتفاع بوته'); return; }
    const cfg: ExperimentalConfig = {
      treatments: designType === DesignType.LSD ? treatments : treatments,
      replications: designType === DesignType.LSD ? treatments : replications,
      traits,
      researchTitle, researcherName,
      factors: (designType === DesignType.FACTORIAL)
        ? { factorA, factorB, labelA: labelA || 'A', labelB: labelB || 'B' } : undefined,
      plots: (designType === DesignType.SPLIT_PLOT)
        ? { mainPlots: factorA, subPlots: factorB, labelMain: labelA || 'Main', labelSub: labelB || 'Sub' } : undefined,
    };
    onSubmit(cfg);
  };

  const isFactorial = designType === DesignType.FACTORIAL || designType === DesignType.SPLIT_PLOT;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          ←
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">تنظیمات آزمایش</h2>
          <p className="text-sm text-slate-500">پارامترهای اولیه طرح را وارد کنید</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اطلاعات کلی */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">اطلاعات تحقیق (اختیاری)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">عنوان تحقیق</label>
              <input className="input" value={researchTitle} onChange={e => setResearchTitle(e.target.value)} placeholder="مثال: اثر کود نیتروژن بر عملکرد گندم" />
            </div>
            <div>
              <label className="label">نام محقق</label>
              <input className="input" value={researcherName} onChange={e => setResearcherName(e.target.value)} placeholder="نام و نام خانوادگی" />
            </div>
          </div>
        </div>

        {/* پارامترهای طرح */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">پارامترهای طرح</h3>

          {designType === DesignType.LSD && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ⚠️ در طرح مربع لاتین، تعداد تیمار = تعداد ردیف = تعداد ستون (ماتریس مربعی)
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {!isFactorial && (
              <div>
                <label className="label">تعداد تیمار (t)</label>
                <input type="number" className="input" min={designType === DesignType.LSD ? 3 : 2} max={20}
                  value={treatments} onChange={e => setTreatments(+e.target.value)} />
              </div>
            )}
            {isFactorial && (
              <>
                <div>
                  <label className="label">{designType === DesignType.SPLIT_PLOT ? 'کرت اصلی (A)' : 'سطوح فاکتور A'}</label>
                  <input type="number" className="input" min={2} max={10} value={factorA} onChange={e => setFactorA(+e.target.value)} />
                </div>
                <div>
                  <label className="label">{designType === DesignType.SPLIT_PLOT ? 'کرت فرعی (B)' : 'سطوح فاکتور B'}</label>
                  <input type="number" className="input" min={2} max={10} value={factorB} onChange={e => setFactorB(+e.target.value)} />
                </div>
                <div>
                  <label className="label">نام فاکتور A (اختیاری)</label>
                  <input className="input" value={labelA} onChange={e => setLabelA(e.target.value)} placeholder="مثال: کود نیتروژن" />
                </div>
                <div>
                  <label className="label">نام فاکتور B (اختیاری)</label>
                  <input className="input" value={labelB} onChange={e => setLabelB(e.target.value)} placeholder="مثال: آبیاری" />
                </div>
              </>
            )}
            {designType !== DesignType.LSD && (
              <div>
                <label className="label">تعداد تکرار (r)</label>
                <input type="number" className="input" min={2} max={20}
                  value={replications} onChange={e => setReplications(+e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {/* صفات */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">صفات مورد اندازه‌گیری</h3>
          <div className="flex gap-2">
            <input className="input flex-1" value={traitInput} onChange={e => setTraitInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTrait(); }}}
              placeholder="نام صفت را وارد کنید (مثال: Yield یا عملکرد)" />
            <button type="button" onClick={addTrait}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
              +افزودن
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {traits.map((tr, i) => (
              <span key={i} className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-sm font-bold">
                {tr}
                <button type="button" onClick={() => setTraits(traits.filter((_, j) => j !== i))}
                  className="text-blue-400 hover:text-red-500 ml-1 font-bold">×</button>
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400">نام صفات باید با ستون‌های فایل Excel مطابقت داشته باشند</p>
        </div>

        {/* دانلود نمونه */}
        <div className="flex items-center justify-between gap-4">
          <a href={getSampleUrl(designType)} download
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            📥 دانلود فایل نمونه Excel
          </a>
          <button type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-base shadow-lg hover:scale-[1.02] transition-transform">
            تولید جدول داده ←
          </button>
        </div>
      </form>
    </div>
  );
};
