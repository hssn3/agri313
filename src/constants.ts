import { DesignType, DesignInfo } from './types';

export const DESIGNS: DesignInfo[] = [
  {
    id: DesignType.CRD,
    title: 'طرح کاملاً تصادفی',
    englishTitle: 'Completely Randomized Design',
    abbreviation: 'CRD',
    description: 'ساده‌ترین طرح آزمایشی. تیمارها به صورت کاملاً تصادفی به واحدهای آزمایشی یکنواخت اختصاص می‌یابند. مناسب برای محیط‌های کنترل‌شده (گلخانه، آزمایشگاه).',
    icon: '🎲',
    color: 'blue',
  },
  {
    id: DesignType.RCBD,
    title: 'طرح بلوک‌های کامل تصادفی',
    englishTitle: 'Randomized Complete Block Design',
    abbreviation: 'RCBD',
    description: 'با تقسیم واحدهای آزمایشی به بلوک‌های همگن، تغییرات محیطی را کنترل می‌کند. پرکاربردترین طرح در تحقیقات مزرعه‌ای.',
    icon: '🔲',
    color: 'green',
  },
  {
    id: DesignType.LSD,
    title: 'طرح مربع لاتین',
    englishTitle: 'Latin Square Design',
    abbreviation: 'LSD',
    description: 'تغییرات در دو جهت عمود بر هم (سطر و ستون) را کنترل می‌کند. تعداد تیمار = تعداد ردیف = تعداد ستون.',
    icon: '⬛',
    color: 'purple',
  },
  {
    id: DesignType.FACTORIAL,
    title: 'طرح فاکتوریل',
    englishTitle: 'Factorial Design',
    abbreviation: 'Factorial',
    description: 'اثرات دو یا چند عامل و اثرات متقابل آن‌ها را همزمان بررسی می‌کند. در قالب بلوک‌های کامل تصادفی اجرا می‌شود.',
    icon: '⚙️',
    color: 'orange',
  },
  {
    id: DesignType.SPLIT_PLOT,
    title: 'طرح کرت‌های خرد شده',
    englishTitle: 'Split-Plot Design',
    abbreviation: 'Split-Plot',
    description: 'برای عواملی که دقت متفاوت نیاز دارند. عامل اصلی در کرت‌های بزرگ و عامل فرعی در کرت‌های کوچک‌تر اعمال می‌شود.',
    icon: '📐',
    color: 'red',
  },
];

export const DESIGN_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/30',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-800',   badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' },
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' },
  purple: { bg: 'bg-violet-50 dark:bg-violet-950/30',  text: 'text-violet-700 dark:text-violet-300',  border: 'border-violet-200 dark:border-violet-800',  badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30',  text: 'text-orange-700 dark:text-orange-300',  border: 'border-orange-200 dark:border-orange-800',  badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' },
  red:    { bg: 'bg-rose-50 dark:bg-rose-950/30',     text: 'text-rose-700 dark:text-rose-300',     border: 'border-rose-200 dark:border-rose-800',     badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200' },
};
