import React, { useState, useEffect } from 'react';
import { HistoryStore, ProjectRecord } from '../services/historyStore';
import { DESIGNS } from '../constants';

interface Props {
  onLoad: (record: ProjectRecord) => void;
  refreshTrigger?: number;
}

export const ProjectHistory: React.FC<Props> = ({ onLoad, refreshTrigger }) => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const reload = () => setProjects(HistoryStore.getAll());

  useEffect(() => { reload(); }, [refreshTrigger]);

  const handleDelete = (id: string) => {
    HistoryStore.delete(id);
    setDeleteId(null);
    reload();
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.designTitle.includes(search) ||
    p.researcherName.includes(search)
  );

  if (projects.length === 0) return (
    <div className="text-center py-10 text-slate-400">
      <p className="text-4xl mb-3">📂</p>
      <p className="font-bold">هنوز پروژه‌ای ذخیره نشده است</p>
      <p className="text-sm mt-1">پس از اجرای تحلیل، پروژه به صورت خودکار ذخیره می‌شود</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          className="input pr-10 w-full"
          placeholder="جستجو در پروژه‌ها..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      </div>

      <p className="text-xs text-slate-400">{filtered.length} پروژه یافت شد</p>

      <div className="space-y-3">
        {filtered.map(proj => {
          const design = DESIGNS.find(d => d.id === proj.designType);
          const date = new Date(proj.updatedAt).toLocaleDateString('fa-IR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          });

          // خلاصه نتایج
          const sigCount = Object.values(proj.result.anovaResults || {}).filter(a =>
            a.sources.some(s => s.significance !== 'ns' && s.fCalc > 0 &&
              !s.source.includes('کل') && !s.source.includes('خطا'))
          ).length;
          const totalTraits = proj.config.traits.length;

          return (
            <div key={proj.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-start justify-between gap-3">
                {/* اطلاعات */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xl">{design?.icon ?? '📊'}</span>
                    <h3 className="font-black text-slate-800 dark:text-white truncate">{proj.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-bold">
                      {design?.abbreviation ?? proj.designType}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                    <span>🗓 {date}</span>
                    {proj.researcherName && <span>👤 {proj.researcherName}</span>}
                    <span>🧪 {proj.config.treatments} تیمار × {proj.config.replications} تکرار</span>
                    <span>📋 {totalTraits} صفت</span>
                    <span className={sigCount > 0 ? 'text-green-600 dark:text-green-400 font-bold' : ''}>
                      {sigCount > 0 ? `✅ ${sigCount} صفت معنی‌دار` : '⬜ غیرمعنی‌دار'}
                    </span>
                  </div>

                  {/* بهترین تیمار هر صفت */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {proj.config.traits.slice(0, 3).map(trait => {
                      const ph = proj.result.postHocResults?.[trait];
                      const best = ph?.groups?.[0];
                      if (!best) return null;
                      return (
                        <span key={trait} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <span className="text-slate-500">{trait}: </span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{best.name}</span>
                          <span className="text-slate-400"> ({best.mean.toFixed(2)})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => onLoad(proj)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    ✏️ بازگشایی
                  </button>
                  <button
                    onClick={() => setDeleteId(proj.id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-xs font-bold transition-colors"
                  >
                    🗑 حذف
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Delete Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full mx-4 shadow-2xl">
            <p className="text-lg font-black text-slate-800 dark:text-white mb-2">حذف پروژه</p>
            <p className="text-sm text-slate-500 mb-5">این پروژه برای همیشه حذف می‌شود. مطمئنید؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                انصراف
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
