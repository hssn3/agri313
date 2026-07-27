import React, { useState } from 'react';

interface Feature {
  category: string;
  name: string;
  description: string;
  priority: 'بالا' | 'متوسط' | 'پایین';
  effort: 'کم' | 'متوسط' | 'زیاد';
  status: 'برنامه‌ریزی شده' | 'در دست بررسی' | 'پیشنهادی';
  source: string;  // از کدام نرم‌افزار الهام گرفته شده
}

const FEATURES: Feature[] = [
  // ── آماری ──────────────────────────────────────────────────
  { category: '📊 آماری پیشرفته',
    name: 'تحلیل پایداری (Stability Analysis)',
    description: 'روش‌های Eberhart & Russell، Shukla، Francis & Kannenberg برای آزمایش‌های چندمکانی',
    priority: 'بالا', effort: 'زیاد', status: 'برنامه‌ریزی شده', source: 'R/agricolae' },
  { category: '📊 آماری پیشرفته',
    name: 'آزمون‌های ناپارامتری',
    description: 'Kruskal-Wallis، Friedman، Mann-Whitney — جایگزین ANOVA وقتی نرمالیته برقرار نیست',
    priority: 'بالا', effort: 'متوسط', status: 'برنامه‌ریزی شده', source: 'R/agricolae + SAS' },
  { category: '📊 آماری پیشرفته',
    name: 'آزمون همگنی واریانس',
    description: 'Bartlett، Levene، Hartley — پیش‌فرض همسانی واریانس‌ها قبل از ANOVA',
    priority: 'بالا', effort: 'کم', status: 'برنامه‌ریزی شده', source: 'SPSS + SAS' },
  { category: '📊 آماری پیشرفته',
    name: 'مدیریت داده گمشده',
    description: 'روش‌های جایگزینی: میانگین، رگرسیون، YATES — تخمین داده مفقود در RCBD و LSD',
    priority: 'بالا', effort: 'متوسط', status: 'برنامه‌ریزی شده', source: 'MSTAT-C + GenStat' },
  { category: '📊 آماری پیشرفته',
    name: 'تشخیص داده پرت (Outlier)',
    description: 'آزمون Grubbs و Dixon — شناسایی و Flag کردن مشاهدات مشکوک',
    priority: 'متوسط', effort: 'کم', status: 'پیشنهادی', source: 'R/outliers' },
  { category: '📊 آماری پیشرفته',
    name: 'وراثت‌پذیری و واریانس ژنتیکی',
    description: 'محاسبه h², واریانس ژنتیکی، فنوتیپی و محیطی برای اصلاح نباتات',
    priority: 'متوسط', effort: 'متوسط', status: 'در دست بررسی', source: 'GenStat + CropBreeding' },
  { category: '📊 آماری پیشرفته',
    name: 'تحلیل مؤلفه اصلی (PCA)',
    description: 'کاهش ابعاد و کشف الگو در مجموعه داده‌های چندصفتی',
    priority: 'متوسط', effort: 'زیاد', status: 'پیشنهادی', source: 'SAS + R/stats' },
  { category: '📊 آماری پیشرفته',
    name: 'Scheffe و Dunnett post-hoc',
    description: 'مقایسه با شاهد (Dunnett) و مقایسه‌های دلخواه (Scheffe)',
    priority: 'متوسط', effort: 'کم', status: 'برنامه‌ریزی شده', source: 'SAS/STAT + SPSS' },

  // ── طرح‌های آزمایشی ─────────────────────────────────────────
  { category: '🧪 طرح‌های آزمایشی',
    name: 'طرح آگمنتد (Augmented Design)',
    description: 'برای غربالگری تعداد زیاد ژنوتیپ با تعداد محدود شاهد — رایج در اصلاح نباتات',
    priority: 'بالا', effort: 'متوسط', status: 'برنامه‌ریزی شده', source: 'R/agricolae' },
  { category: '🧪 طرح‌های آزمایشی',
    name: 'طرح الفا (Alpha Design)',
    description: 'بلوک‌های ناقص با اندازه بلوک کوچک‌تر از تعداد تیمار',
    priority: 'متوسط', effort: 'زیاد', status: 'در دست بررسی', source: 'R/agricolae' },
  { category: '🧪 طرح‌های آزمایشی',
    name: 'طرح Strip-Plot',
    description: 'کرت‌های نواری — وقتی دو فاکتور هر دو نیاز به کرت بزرگ دارند',
    priority: 'متوسط', effort: 'متوسط', status: 'برنامه‌ریزی شده', source: 'GenStat + SAS' },
  { category: '🧪 طرح‌های آزمایشی',
    name: 'تولید خودکار طرح تصادفی',
    description: 'تولید چیدمان تصادفی کرت‌ها (Field Layout) و نقشه مزرعه',
    priority: 'پایین', effort: 'متوسط', status: 'پیشنهادی', source: 'R/agricolae + FarmStat' },

  // ── نمودار و تصویرسازی ─────────────────────────────────────
  { category: '📈 نمودار و تصویرسازی',
    name: 'Interaction Plot',
    description: 'نمودار اثر متقابل برای طرح‌های فاکتوریل — نشان دادن بصری تداخل فاکتورها',
    priority: 'بالا', effort: 'کم', status: 'برنامه‌ریزی شده', source: 'SAS + SPSS' },
  { category: '📈 نمودار و تصویرسازی',
    name: 'Error Bar Chart',
    description: 'نمودار میله‌ای با نوار خطا (SD یا SE) و حروف گروه‌بندی Duncan',
    priority: 'بالا', effort: 'کم', status: 'برنامه‌ریزی شده', source: 'SAS/GRAPH + R/ggplot2' },
  { category: '📈 نمودار و تصویرسازی',
    name: 'Box Plot',
    description: 'نمودار جعبه‌ای برای نمایش توزیع داده‌ها و شناسایی پرت',
    priority: 'متوسط', effort: 'کم', status: 'برنامه‌ریزی شده', source: 'R/ggplot2 + Minitab' },
  { category: '📈 نمودار و تصویرسازی',
    name: 'Q-Q Plot نرمالیته',
    description: 'نمودار Normal Q-Q برای تشخیص بصری انحراف از نرمالیته',
    priority: 'متوسط', effort: 'کم', status: 'پیشنهادی', source: 'R/stats + SPSS' },
  { category: '📈 نمودار و تصویرسازی',
    name: 'Residual Diagnostic Plots',
    description: 'نمودار باقیمانده‌ها — Residuals vs Fitted، Scale-Location برای بررسی مفروضات',
    priority: 'متوسط', effort: 'متوسط', status: 'پیشنهادی', source: 'R/lm + SAS/REG' },

  // ── خروجی و گزارش ──────────────────────────────────────────
  { category: '📄 خروجی و گزارش',
    name: 'Import مستقیم از Excel (XLSX)',
    description: 'پارس کردن فایل‌های .xlsx بدون تبدیل به CSV — با کتابخانه SheetJS',
    priority: 'بالا', effort: 'کم', status: 'برنامه‌ریزی شده', source: 'SheetJS' },
  { category: '📄 خروجی و گزارش',
    name: 'گزارش Word (DOCX)',
    description: 'خروجی گزارش به فرمت Word آماده ویرایش — برای مقالات علمی',
    priority: 'متوسط', effort: 'متوسط', status: 'در دست بررسی', source: 'docx.js' },
  { category: '📄 خروجی و گزارش',
    name: 'قالب گزارش APA/JAST',
    description: 'گزارش اتوماتیک مطابق فرمت مجلات علمی کشاورزی ایران (JAST, JCPP)',
    priority: 'متوسط', effort: 'متوسط', status: 'پیشنهادی', source: 'Custom' },

  // ── سیستم و کاربران ─────────────────────────────────────────
  { category: '👤 سیستم و کاربران',
    name: 'احراز هویت کامل JWT',
    description: 'ثبت‌نام، ورود، بازیابی رمز — با JWT token و refresh token',
    priority: 'بالا', effort: 'متوسط', status: 'برنامه‌ریزی شده', source: 'Custom Backend' },
  { category: '👤 سیستم و کاربران',
    name: 'سیستم اشتراک و توکن',
    description: 'خرید اشتراک ماهانه/سالانه — هر تحلیل مصرف توکن می‌کند',
    priority: 'متوسط', effort: 'زیاد', status: 'در دست بررسی', source: 'Custom' },
  { category: '👤 سیستم و کاربران',
    name: 'ذخیره‌سازی cloud',
    description: 'پروژه‌ها در سرور ذخیره شوند — قابل دسترس از هر دستگاه',
    priority: 'بالا', effort: 'زیاد', status: 'برنامه‌ریزی شده', source: 'PostgreSQL + S3' },
  { category: '👤 سیستم و کاربران',
    name: 'API عمومی',
    description: 'REST API برای یکپارچه‌سازی با سیستم‌های دیگر — مثل Excel Add-in',
    priority: 'پایین', effort: 'متوسط', status: 'پیشنهادی', source: 'Custom' },
  { category: '👤 سیستم و کاربران',
    name: 'تفسیر هوشمند با Gemini AI',
    description: 'یکپارچه‌سازی اختیاری با Gemini — تولید بحث علمی پیشرفته‌تر',
    priority: 'پایین', effort: 'کم', status: 'برنامه‌ریزی شده', source: 'Google Gemini API' },
];

const PRIORITY_COLOR: Record<string, string> = {
  'بالا':    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'متوسط':  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'پایین':  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};
const EFFORT_COLOR: Record<string, string> = {
  'کم':    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'متوسط':'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'زیاد': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};
const STATUS_COLOR: Record<string, string> = {
  'برنامه‌ریزی شده': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'در دست بررسی':    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'پیشنهادی':         'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

export const FeatureRoadmap: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterCat, setFilterCat] = useState('همه');
  const [filterPriority, setFilterPriority] = useState('همه');

  const categories = ['همه', ...Array.from(new Set(FEATURES.map(f => f.category)))];
  const priorities  = ['همه', 'بالا', 'متوسط', 'پایین'];

  const filtered = FEATURES.filter(f =>
    (filterCat === 'همه' || f.category === filterCat) &&
    (filterPriority === 'همه' || f.priority === filterPriority)
  );

  const counts = {
    total: FEATURES.length,
    high: FEATURES.filter(f => f.priority === 'بالا').length,
    planned: FEATURES.filter(f => f.status === 'برنامه‌ریزی شده').length,
  };

  return (
    <>
      {/* دکمه ثابت پایین صفحه */}
      <div className="fixed bottom-6 left-6 z-40 no-print">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black shadow-2xl shadow-violet-500/30 hover:scale-105 transition-transform text-sm"
        >
          🗺️ نقشه راه امکانات
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{counts.total}</span>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4 flex-shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">🗺️ نقشه راه امکانات آینده</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {counts.total} امکان پیشنهادی —
                  <span className="text-red-600 dark:text-red-400 font-bold"> {counts.high} اولویت بالا</span> —
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold"> {counts.planned} برنامه‌ریزی شده</span>
                </p>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500">
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">دسته:</span>
                <div className="flex gap-1 flex-wrap">
                  {categories.map(c => (
                    <button key={c} onClick={() => setFilterCat(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${filterCat === c ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                      {c === 'همه' ? c : c.split(' ').slice(1).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">اولویت:</span>
                <div className="flex gap-1">
                  {priorities.map(p => (
                    <button key={p} onClick={() => setFilterPriority(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${filterPriority === p ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs text-slate-400 self-center mr-auto">{filtered.length} آیتم</span>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0">
                  <tr className="bg-slate-700 text-white text-xs">
                    <th className="px-4 py-2.5 text-right font-bold whitespace-nowrap">امکان</th>
                    <th className="px-4 py-2.5 text-right font-bold whitespace-nowrap">توضیح</th>
                    <th className="px-4 py-2.5 text-center font-bold whitespace-nowrap">اولویت</th>
                    <th className="px-4 py-2.5 text-center font-bold whitespace-nowrap">تلاش</th>
                    <th className="px-4 py-2.5 text-center font-bold whitespace-nowrap">وضعیت</th>
                    <th className="px-4 py-2.5 text-right font-bold whitespace-nowrap">الهام از</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f, i) => (
                    <tr key={i} className={`border-b border-slate-100 dark:border-slate-800 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-slate-800 dark:text-white whitespace-nowrap">{f.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{f.category}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 max-w-xs">{f.description}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${PRIORITY_COLOR[f.priority]}`}>{f.priority}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${EFFORT_COLOR[f.effort]}`}>{f.effort}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR[f.status]}`}>{f.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-400 whitespace-nowrap">{f.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 flex-shrink-0">
              برای پیشنهاد امکانات جدید یا اولویت‌بندی — با تیم توسعه تماس بگیرید
            </div>
          </div>
        </div>
      )}
    </>
  );
};
