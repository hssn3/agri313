import React, { useState, useEffect } from 'react';

interface User {
  id: string; email: string; name: string; role: string;
  isActive: boolean; tokensUsed: number; tokensLimit: number; createdAt: string;
}

export const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('stats');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/stats').then(r => r.json()),
    ]).then(([u, s]) => {
      if (u.success) setUsers(u.data);
      if (s.success) setStats(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">←</button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">پنل مدیریت</h2>
          <p className="text-xs text-orange-500 font-bold">⚠️ این قسمت در نسخه تست است — احراز هویت در نسخه بعدی فعال می‌شود</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {[{ id: 'stats', label: '📊 آمار سیستم' }, { id: 'users', label: '👥 کاربران' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === t.id ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">⏳ در حال بارگذاری...</div>
      ) : (
        <>
          {activeTab === 'stats' && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'کل کاربران', val: stats.totalUsers, color: 'blue' },
                { label: 'کاربران فعال', val: stats.activeUsers, color: 'green' },
                { label: 'تحلیل‌ها', val: stats.totalAnalyses, color: 'purple' },
                { label: 'نسخه', val: stats.systemVersion, color: 'orange' },
              ].map(({ label, val, color }) => (
                <div key={label} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-center`}>
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{val}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-700 text-white text-xs">
                      {['نام','ایمیل','نقش','وضعیت','توکن مصرفی','محدودیت توکن','تاریخ ثبت'].map(h => (
                        <th key={h} className="px-4 py-2 text-right font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} className={`border-b border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? '' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                        <td className="px-4 py-2 font-bold text-slate-800 dark:text-white">{u.name}</td>
                        <td className="px-4 py-2 text-slate-500 font-mono text-xs">{u.email}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-500'}`}>{u.isActive ? 'فعال' : 'غیرفعال'}</span>
                        </td>
                        <td className="px-4 py-2 text-center font-mono">{u.tokensUsed}</td>
                        <td className="px-4 py-2 text-center font-mono">{u.tokensLimit}</td>
                        <td className="px-4 py-2 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString('fa-IR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
        <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">🔮 قابلیت‌های آینده</h4>
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
          <li>ثبت‌نام و ورود کاربران با JWT authentication</li>
          <li>سیستم توکن برای استفاده از سرویس‌های پیشرفته</li>
          <li>درگاه پرداخت برای خرید اشتراک</li>
          <li>تاریخچه تحلیل‌های هر کاربر</li>
          <li>یکپارچه‌سازی اختیاری با Gemini AI برای تفسیر هوشمند</li>
        </ul>
      </div>
    </div>
  );
};
