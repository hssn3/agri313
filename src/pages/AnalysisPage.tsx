import React, { useState, useCallback } from 'react';
import { DataRow, ExperimentalConfig, DesignType, ComparisonMethod, AnalysisResult } from '../types';
import { runLocalAnalysis } from '../services/localEngine';
import { StatsEngine } from '../engine/statsEngine';
import { DescriptiveStats } from '../components/DescriptiveStats';
import { AnovaTable } from '../components/AnovaTable';
import { MeanComparisonTable } from '../components/MeanComparisonTable';
import { Visualizations } from '../components/Visualizations';
import { FinalReport } from '../components/FinalReport';

interface Props {
  data: DataRow[];
  config: ExperimentalConfig;
  designType: DesignType;
  onBack: () => void;
  onAnalysisDone?: (result: AnalysisResult) => void;
}

type Tab = 'descriptive' | 'anova' | 'comparison' | 'charts' | 'report';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'descriptive', label: 'آمار توصیفی', emoji: '📋' },
  { id: 'anova', label: 'تجزیه واریانس', emoji: '📊' },
  { id: 'comparison', label: 'مقایسه میانگین', emoji: '🏆' },
  { id: 'charts', label: 'نمودارها', emoji: '📈' },
  { id: 'report', label: 'گزارش نهایی', emoji: '📄' },
];

export const AnalysisPage: React.FC<Props> = ({ data, config, designType, onBack, onAnalysisDone }) => {
  const [currentData, setCurrentData] = useState(data);
  const [method, setMethod] = useState<ComparisonMethod>('DUNCAN');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('descriptive');

  const descriptiveStats = StatsEngine.calculateStats(currentData, config.traits);

  const handleTransform = useCallback((trait: string, type: 'log' | 'sqrt' | 'arcsin') => {
    const newData = StatsEngine.transformData(currentData, trait, type);
    setCurrentData(newData);
    setResult(null);
  }, [currentData]);

  const handleRunAnalysis = () => {
    setRunning(true);
    try {
      const r = runLocalAnalysis({ data: currentData, traits: config.traits, designType, config, method });
      setResult(r);
      setActiveTab('anova');
      onAnalysisDone?.(r);
    } catch (err: any) {
      alert('خطا در محاسبات: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleResetData = () => { setCurrentData(data); setResult(null); };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">←</button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">تحلیل داده‌ها</h2>
            <p className="text-sm text-slate-500">{currentData.length} مشاهده | {config.traits.length} صفت</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleResetData} className="px-4 py-2 text-sm font-bold border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            🔄 بازنشانی داده
          </button>
          <select value={method} onChange={e => setMethod(e.target.value as ComparisonMethod)}
            className="px-3 py-2 text-sm font-bold border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none">
            <option value="DUNCAN">آزمون دانکن</option>
            <option value="TUKEY">آزمون Tukey HSD</option>
            <option value="LSD">آزمون LSD</option>
          </select>
          <button onClick={handleRunAnalysis} disabled={running}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-black shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
            {running ? <><span className="animate-spin">⏳</span> در حال محاسبه...</> : <>▶ اجرای تحلیل کامل</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            disabled={tab.id !== 'descriptive' && !result}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            <span>{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'descriptive' && (
          <DescriptiveStats stats={descriptiveStats} onTransform={handleTransform} />
        )}
        {activeTab === 'anova' && result && (
          <AnovaTable results={result.anovaResults} />
        )}
        {activeTab === 'comparison' && result && (
          <MeanComparisonTable results={result.postHocResults} />
        )}
        {activeTab === 'charts' && result && (
          <Visualizations result={result} />
        )}
        {activeTab === 'report' && result && (
          <FinalReport designType={designType} config={config} result={result} />
        )}
        {activeTab !== 'descriptive' && !result && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-4">▶</p>
            <p className="text-lg font-bold">ابتدا تحلیل را اجرا کنید</p>
            <p className="text-sm mt-2">روی دکمه "اجرای تحلیل کامل" کلیک کنید</p>
          </div>
        )}
      </div>
    </div>
  );
};
