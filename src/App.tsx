import React, { useState, useEffect, useCallback } from 'react';
import { DesignType, ExperimentalConfig, DataRow, AnalysisResult } from './types';
import { DESIGNS } from './constants';
import { DesignCard } from './components/DesignCard';
import { DataEntryForm } from './components/DataEntryForm';
import { DataTable } from './components/DataTable';
import { AnalysisPage } from './pages/AnalysisPage';
import { AdminPage } from './pages/AdminPage';
import { ProjectHistory } from './components/ProjectHistory';
import { FeatureRoadmap } from './components/FeatureRoadmap';
import { HistoryStore, ProjectRecord } from './services/historyStore';
import { DESIGNS as DESIGN_LIST } from './constants';

type AppView = 'HOME' | 'CONFIG' | 'TABLE' | 'ANALYSIS' | 'ADMIN' | 'HISTORY';

const APP_VERSION = (window as any).__APP_VERSION__ ?? '1.1.0';

const App: React.FC = () => {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [view, setView] = useState<AppView>('HOME');
  const [selectedDesign, setSelectedDesign] = useState<DesignType | null>(null);
  const [config, setConfig] = useState<ExperimentalConfig | null>(null);
  const [tableData, setTableData] = useState<DataRow[]>([]);
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    setProjectCount(HistoryStore.count());
  }, [historyRefresh]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleDesignSelect = (id: string) => {
    setSelectedDesign(id as DesignType);
    setView('CONFIG');
    scrollTop();
  };

  // ذخیره نتیجه تحلیل در history
  const handleAnalysisDone = useCallback((result: AnalysisResult, data: DataRow[], cfg: ExperimentalConfig, design: DesignType) => {
    setLastResult(result);
    const designInfo = DESIGN_LIST.find(d => d.id === design);
    HistoryStore.save({
      title: cfg.researchTitle || `${designInfo?.title ?? design} — ${new Date().toLocaleDateString('fa-IR')}`,
      designType: design,
      designTitle: designInfo?.title ?? design,
      researcherName: cfg.researcherName ?? '',
      config: cfg,
      data,
      result,
    });
    setHistoryRefresh(n => n + 1);
  }, []);

  // بارگذاری پروژه از history
  const handleLoadProject = (record: ProjectRecord) => {
    setSelectedDesign(record.designType);
    setConfig(record.config);
    setTableData(record.data);
    setLastResult(record.result);
    setView('ANALYSIS');
    scrollTop();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => { setView('HOME'); scrollTop(); }}
            className="flex items-center gap-2 text-lg font-black text-slate-800 dark:text-white hover:opacity-80 transition-opacity">
            <span className="text-2xl">🌱</span>
            <span className="hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              SmartAgri Analyze
            </span>
            <span className="hidden md:block text-xs font-mono text-slate-400">v{APP_VERSION}</span>
          </button>

          {/* Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* breadcrumb */}
            {view !== 'HOME' && view !== 'HISTORY' && view !== 'ADMIN' && (
              <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 ml-2">
                <span className="cursor-pointer hover:text-blue-500" onClick={() => { setView('HOME'); scrollTop(); }}>خانه</span>
                {view === 'CONFIG' && <><span>/</span><span>تنظیمات</span></>}
                {view === 'TABLE' && <><span>/</span><span>داده</span></>}
                {view === 'ANALYSIS' && <><span>/</span><span>تحلیل</span></>}
              </div>
            )}

            {/* History button */}
            <button
              onClick={() => { setView('HISTORY'); scrollTop(); }}
              title="پروژه‌های قبلی"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${view === 'HISTORY' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              📂 پروژه‌ها
              {projectCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${view === 'HISTORY' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>
                  {projectCount}
                </span>
              )}
            </button>

            <button onClick={() => { setView('ADMIN'); scrollTop(); }}
              title="پنل مدیریت"
              className={`p-2 rounded-xl border transition-colors text-sm ${view === 'ADMIN' ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}>
              ⚙️
            </button>
            <button onClick={() => setDark(!dark)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">

        {/* HOME */}
        {view === 'HOME' && (
          <div className="space-y-12">
            {/* Hero */}
            <section className="text-center pt-8 pb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold mb-6">
                🌾 پلتفرم تحلیل آماری طرح‌های آزمایشی کشاورزی
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                محاسبه هوشمند<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500">
                  طرح‌های آزمایشی کشاورزی
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                تحلیل کامل ANOVA، مقایسه میانگین Duncan/Tukey/LSD، همبستگی و رگرسیون.
                مستقل از اینترنت — بدون نیاز به API — خروجی Excel و PDF.
              </p>
              <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
                {[['5','طرح آزمایشی'],['3','روش مقایسه'],['100%','محاسبات محلی'],[String(projectCount || '∞'),'پروژه ذخیره‌شده']].map(([n,l]) => (
                  <div key={l} className="text-center">
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{n}</p>
                    <p className="text-xs text-slate-500 mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Design Cards */}
            <section>
              <h2 className="text-xl font-black text-slate-700 dark:text-slate-200 mb-4">طرح آزمایشی خود را انتخاب کنید</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {DESIGNS.map(d => <DesignCard key={d.id} design={d} onClick={handleDesignSelect} />)}
              </div>
            </section>

            {/* Recent Projects */}
            {projectCount > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-slate-700 dark:text-slate-200">آخرین پروژه‌ها</h2>
                  <button onClick={() => { setView('HISTORY'); scrollTop(); }}
                    className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    مشاهده همه ←
                  </button>
                </div>
                <ProjectHistory onLoad={handleLoadProject} refreshTrigger={historyRefresh} />
              </section>
            )}

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon:'🧮', title:'محاسبات دقیق', desc:'موتور محاسباتی با F/t/q عددی دقیق و Shapiro-Wilk واقعی' },
                { icon:'📊', title:'گزارش جامع', desc:'تفسیر فارسی rule-based + خروجی Excel و PDF قابل چاپ' },
                { icon:'🎲', title:'داده نمونه', desc:'داده‌های واقعی از Gomez&Gomez، Steel&Torrie، Cochran&Cox' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex gap-4">
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white mb-1">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* HISTORY */}
        {view === 'HISTORY' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <button onClick={() => { setView('HOME'); scrollTop(); }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">←</button>
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">پروژه‌های ذخیره‌شده</h2>
                <p className="text-sm text-slate-500">{projectCount} پروژه</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <ProjectHistory onLoad={handleLoadProject} refreshTrigger={historyRefresh} />
            </div>
          </div>
        )}

        {/* CONFIG */}
        {view === 'CONFIG' && selectedDesign && (
          <DataEntryForm
            designType={selectedDesign}
            onBack={() => { setView('HOME'); scrollTop(); }}
            onSubmit={(cfg) => { setConfig(cfg); setView('TABLE'); scrollTop(); }}
          />
        )}

        {/* TABLE */}
        {view === 'TABLE' && selectedDesign && config && (
          <DataTable
            designType={selectedDesign}
            config={config}
            onBack={() => { setView('CONFIG'); scrollTop(); }}
            onStartAnalysis={(d) => { setTableData(d); setView('ANALYSIS'); scrollTop(); }}
          />
        )}

        {/* ANALYSIS */}
        {view === 'ANALYSIS' && selectedDesign && config && (
          <AnalysisPage
            data={tableData}
            config={config}
            designType={selectedDesign}
            onBack={() => { setView('TABLE'); scrollTop(); }}
            onAnalysisDone={(result) => handleAnalysisDone(result, tableData, config, selectedDesign)}
          />
        )}

        {/* ADMIN */}
        {view === 'ADMIN' && (
          <AdminPage onBack={() => { setView('HOME'); scrollTop(); }} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-sm text-slate-400 no-print">
        <p className="font-bold">SmartAgri Analyze v{APP_VERSION} &copy; 2024</p>
        <p className="text-xs mt-1">مستقل از اینترنت | بدون AI API | تمام محاسبات محلی</p>
        <button
          onClick={() => {
            const cl = `# CHANGELOG\nبرای مشاهده تاریخچه کامل فایل CHANGELOG.md را ببینید.\n\nنسخه فعلی: ${APP_VERSION}`;
            alert(cl);
          }}
          className="text-xs text-slate-400 hover:text-blue-500 transition-colors mt-2 underline"
        >
          مشاهده changelog
        </button>
      </footer>

      {/* Floating Roadmap Button */}
      <FeatureRoadmap />
    </div>
  );
};

export default App;
