import React, { useState, useEffect } from 'react';
import { DesignType, ExperimentalConfig, DataRow } from './types';
import { DESIGNS } from './constants';
import { DesignCard } from './components/DesignCard';
import { DataEntryForm } from './components/DataEntryForm';
import { DataTable } from './components/DataTable';
import { AnalysisPage } from './pages/AnalysisPage';
import { AdminPage } from './pages/AdminPage';

type AppView = 'HOME' | 'CONFIG' | 'TABLE' | 'ANALYSIS' | 'ADMIN';

const App: React.FC = () => {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [view, setView] = useState<AppView>('HOME');
  const [selectedDesign, setSelectedDesign] = useState<DesignType | null>(null);
  const [config, setConfig] = useState<ExperimentalConfig | null>(null);
  const [tableData, setTableData] = useState<DataRow[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleDesignSelect = (id: string) => {
    setSelectedDesign(id as DesignType);
    setView('CONFIG');
    scrollTop();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => { setView('HOME'); scrollTop(); }}
            className="flex items-center gap-2 text-lg font-black text-slate-800 dark:text-white hover:opacity-80 transition-opacity">
            <span className="text-2xl">🌱</span>
            <span className="hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              SmartAgri Analyze
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* breadcrumb */}
            {view !== 'HOME' && (
              <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 ml-4">
                <span className="cursor-pointer hover:text-blue-500" onClick={() => { setView('HOME'); scrollTop(); }}>خانه</span>
                {view === 'CONFIG' && <><span>/</span><span className="text-slate-600 dark:text-slate-300">تنظیمات</span></>}
                {view === 'TABLE' && <><span>/</span><span className="text-slate-600 dark:text-slate-300">ورود داده</span></>}
                {view === 'ANALYSIS' && <><span>/</span><span className="text-slate-600 dark:text-slate-300">تحلیل</span></>}
                {view === 'ADMIN' && <><span>/</span><span className="text-slate-600 dark:text-slate-300">پنل مدیریت</span></>}
              </div>
            )}
            <button onClick={() => { setView('ADMIN'); scrollTop(); }}
              title="پنل مدیریت"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 text-sm">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
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
                مستقل از اینترنت — بدون نیاز به API خارجی — خروجی Excel و PDF.
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
                {[['5', 'طرح آزمایشی'], ['3', 'روش مقایسه میانگین'], ['100%', 'محاسبات محلی']].map(([n, l]) => (
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

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: '🧮', title: 'محاسبات دقیق', desc: 'موتور محاسباتی کامل با جداول F، t، q و آزمون Shapiro-Wilk واقعی' },
                { icon: '📊', title: 'گزارش جامع', desc: 'تفسیر خودکار نتایج به فارسی علمی + خروجی Excel و PDF' },
                { icon: '📁', title: 'Import/Export', desc: 'ورود داده از فایل CSV/Excel + دانلود نمونه برای هر طرح' },
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

        {view === 'CONFIG' && selectedDesign && (
          <DataEntryForm
            designType={selectedDesign}
            onBack={() => { setView('HOME'); scrollTop(); }}
            onSubmit={(cfg) => { setConfig(cfg); setView('TABLE'); scrollTop(); }}
          />
        )}

        {view === 'TABLE' && selectedDesign && config && (
          <DataTable
            designType={selectedDesign}
            config={config}
            onBack={() => { setView('CONFIG'); scrollTop(); }}
            onStartAnalysis={(d) => { setTableData(d); setView('ANALYSIS'); scrollTop(); }}
          />
        )}

        {view === 'ANALYSIS' && selectedDesign && config && (
          <AnalysisPage
            data={tableData}
            config={config}
            designType={selectedDesign}
            onBack={() => { setView('TABLE'); scrollTop(); }}
          />
        )}

        {view === 'ADMIN' && (
          <AdminPage onBack={() => { setView('HOME'); scrollTop(); }} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-sm text-slate-400">
        <p className="font-bold">SmartAgri Analyze &copy; 2024 — تحلیل آماری طرح‌های کشاورزی</p>
        <p className="text-xs mt-1">مستقل از اینترنت | بدون AI API | تمام محاسبات محلی</p>
      </footer>
    </div>
  );
};

export default App;
