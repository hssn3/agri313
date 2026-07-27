/**
 * interpreter.ts
 * تفسیر rule-based نتایج آماری به فارسی علمی — بدون AI
 * بر اساس استانداردهای آمار زیستی کشاورزی
 */

import type {
  TraitStats, AnovaResult, PostHocResult,
  CorrelationMatrix, RegressionResult, DesignType, ExperimentalConfig,
} from '../types';

// ============================================================
// تفسیر آمار توصیفی
// ============================================================
export function interpretDescriptive(stats: TraitStats): string {
  const parts: string[] = [];

  // میانگین و پراکندگی
  parts.push(
    `میانگین صفت ${stats.traitName} برابر با ${stats.mean.toFixed(4)} با انحراف معیار ${stats.stdDev.toFixed(4)} بود.`
  );

  // ضریب تغییرات
  if (stats.cv < 10) {
    parts.push(`ضریب تغییرات (CV = ${stats.cv.toFixed(2)}٪) نشان‌دهنده دقت بسیار بالای آزمایش است.`);
  } else if (stats.cv < 20) {
    parts.push(`ضریب تغییرات (CV = ${stats.cv.toFixed(2)}٪) در محدوده قابل‌قبول و نشان‌دهنده دقت مناسب آزمایش است.`);
  } else if (stats.cv < 30) {
    parts.push(`ضریب تغییرات (CV = ${stats.cv.toFixed(2)}٪) نسبتاً بالا بوده و ممکن است ناشی از تنوع طبیعی داده‌ها یا نویز آزمایشی باشد.`);
  } else {
    parts.push(`ضریب تغییرات (CV = ${stats.cv.toFixed(2)}٪) بالا است که نشان‌دهنده پراکندگی زیاد داده‌ها و نیاز به بررسی شرایط آزمایش است.`);
  }

  // نرمالیته
  if (stats.isNormal) {
    parts.push(
      `بر اساس آزمون Shapiro-Wilk (W = ${stats.swW.toFixed(4)}، p = ${stats.swPValue.toFixed(4)})، ` +
      `داده‌های این صفت از توزیع نرمال پیروی می‌کنند (p > 0.05) و پیش‌فرض‌های آماری ANOVA برقرار است.`
    );
  } else {
    parts.push(
      `آزمون Shapiro-Wilk (W = ${stats.swW.toFixed(4)}، p = ${stats.swPValue.toFixed(4)}) نشان داد ` +
      `داده‌ها از توزیع نرمال پیروی نمی‌کنند (p < 0.05). توصیه می‌شود از تبدیل داده (لگاریتم، ریشه دوم، یا آرک‌سینوس) استفاده شود.`
    );
  }

  // چولگی
  if (Math.abs(stats.skewness) > 1) {
    const dir = stats.skewness > 0 ? 'مثبت (راست)' : 'منفی (چپ)';
    parts.push(`توزیع داده‌ها دارای چولگی ${dir} (${stats.skewness.toFixed(3)}) است که از تقارن فاصله دارد.`);
  }

  return parts.join(' ');
}

// ============================================================
// تفسیر نتایج ANOVA
// ============================================================
export function interpretAnova(anova: AnovaResult, designType: DesignType): string {
  const parts: string[] = [];
  const trait = anova.traitName;

  anova.sources.forEach(src => {
    if (src.source.includes('کل') || src.source.includes('Total')) return;
    if (src.source.includes('خطا') || src.source.toLowerCase().includes('error')) return;

    const sigText = src.significance === '**'
      ? 'در سطح احتمال یک درصد (p < 0.01) معنی‌دار'
      : src.significance === '*'
        ? 'در سطح احتمال پنج درصد (p < 0.05) معنی‌دار'
        : 'معنی‌دار نبود (p > 0.05)';

    const fText = `F محاسبه‌شده = ${src.fCalc.toFixed(3)}`;
    const fTabText = `F جدولی (0.05) = ${src.fTab05.toFixed(3)}، F جدولی (0.01) = ${src.fTab01.toFixed(3)}`;

    parts.push(
      `اثر ${src.source} برای صفت ${trait} با ${fText} (df = ${src.df}) ` +
      `${sigText} بود [${fTabText}].`
    );
  });

  // خطای آزمایش
  const errSrc = anova.sources.find(s => s.source.includes('خطا') || s.source.toLowerCase().includes('error b') || s.source.toLowerCase().includes('error'));
  if (errSrc) {
    parts.push(
      `میانگین مربعات خطا (MSE) برابر با ${errSrc.ms.toFixed(4)} با ${errSrc.df} درجه آزادی بود.`
    );
  }

  return parts.join(' ');
}

// ============================================================
// تفسیر مقایسه میانگین‌ها (Post-Hoc)
// ============================================================
export function interpretPostHoc(ph: PostHocResult): string {
  if (!ph.isSignificant) {
    return `از آنجا که اثر تیمار برای صفت ${ph.traitName} معنی‌دار نبود، مقایسه میانگین‌ها انجام نگردید.`;
  }

  const methodName: Record<string, string> = {
    DUNCAN: 'آزمون چنددامنه‌ای دانکن',
    TUKEY: 'آزمون Tukey HSD',
    LSD: 'آزمون LSD (کمترین تفاوت معنی‌دار)',
  };
  const method = methodName[ph.method] || ph.method;

  const best = ph.groups[0];
  const worst = ph.groups[ph.groups.length - 1];

  const distinctGroups = new Set(ph.groups.flatMap(g => g.letter.split('')));
  const nGroups = distinctGroups.size;

  let text = `بر اساس ${method} (در سطح پنج درصد) برای صفت ${ph.traitName}، `;
  text += `تیمارها در ${nGroups} گروه آماری مجزا قرار گرفتند. `;
  text += `بالاترین میانگین متعلق به تیمار ${best.name} (${best.mean.toFixed(4)}) `;
  text += `با گروه‌بندی حرفی "${best.letter.toUpperCase()}" بود. `;

  if (ph.groups.length > 1) {
    text += `پایین‌ترین میانگین به تیمار ${worst.name} (${worst.mean.toFixed(4)}) `;
    text += `با گروه‌بندی حرفی "${worst.letter.toUpperCase()}" تعلق داشت.`;
  }

  // گروه‌هایی که در یک دسته هستند
  const sharedGroups: string[][] = [];
  ph.groups.forEach(g => {
    g.letter.split('').forEach(l => {
      const existing = sharedGroups.find(sg => sg[0] === l);
      if (existing) existing.push(g.name);
      else sharedGroups.push([l, g.name]);
    });
  });
  const nonSig = sharedGroups.filter(sg => sg.length > 2); // بیش از یک تیمار در گروه
  if (nonSig.length > 0) {
    const pairs = nonSig.map(sg => sg.slice(1).join('، ')).join('؛ ');
    text += ` تیمارهای ${pairs} از نظر آماری تفاوت معنی‌داری با یکدیگر نداشتند.`;
  }

  return text;
}

// ============================================================
// تفسیر ماتریس همبستگی
// ============================================================
export function interpretCorrelation(matrix: CorrelationMatrix): string {
  const parts: string[] = [];
  const traits = matrix.traits;

  const significant: { t1: string; t2: string; r: number; level: string }[] = [];
  for (let i = 0; i < traits.length; i++) {
    for (let j = i + 1; j < traits.length; j++) {
      const cell = matrix.matrix[traits[i]][traits[j]];
      if (cell.significance !== 'ns') {
        significant.push({
          t1: traits[i], t2: traits[j],
          r: cell.r,
          level: cell.significance === '**' ? 'سطح یک درصد' : 'سطح پنج درصد',
        });
      }
    }
  }

  if (significant.length === 0) {
    return 'بین هیچ‌کدام از صفات مورد بررسی همبستگی معنی‌داری مشاهده نشد.';
  }

  significant.forEach(({ t1, t2, r, level }) => {
    const dir = r > 0 ? 'مثبت و معنی‌دار' : 'منفی و معنی‌دار';
    const strength = Math.abs(r) > 0.7 ? 'قوی' : Math.abs(r) > 0.4 ? 'متوسط' : 'ضعیف';
    parts.push(
      `بین صفات ${t1} و ${t2}، همبستگی ${dir} (r = ${r.toFixed(4)}) در ${level} وجود داشت که از نوع ${strength} بود.`
    );
  });

  return parts.join(' ');
}

// ============================================================
// تفسیر رگرسیون
// ============================================================
export function interpretRegression(reg: RegressionResult): string {
  const r2Pct = (reg.rSquare * 100).toFixed(2);
  const slopeText = reg.slope > 0
    ? `به ازای هر یک واحد افزایش در ${reg.independentTrait}، مقدار ${reg.dependentTrait} به میزان ${reg.slope.toFixed(4)} واحد افزایش می‌یابد`
    : `به ازای هر یک واحد افزایش در ${reg.independentTrait}، مقدار ${reg.dependentTrait} به میزان ${Math.abs(reg.slope).toFixed(4)} واحد کاهش می‌یابد`;

  let quality: string;
  if (reg.rSquare > 0.8) quality = 'برازش بسیار خوبی';
  else if (reg.rSquare > 0.6) quality = 'برازش خوبی';
  else if (reg.rSquare > 0.4) quality = 'برازش متوسطی';
  else quality = 'برازش ضعیفی';

  return (
    `معادله رگرسیون خطی بین ${reg.independentTrait} (متغیر مستقل) و ${reg.dependentTrait} (متغیر وابسته) ` +
    `به صورت ${reg.equation} به دست آمد. ضریب تعیین (R² = ${reg.rSquare.toFixed(4)}) نشان داد که ` +
    `${r2Pct}٪ از تغییرات ${reg.dependentTrait} توسط ${reg.independentTrait} توجیه می‌شود. ` +
    `مدل ${quality} دارد. ${slopeText}.`
  );
}

// ============================================================
// گزارش جامع نتایج و بحث
// ============================================================
export function generateFullReport(params: {
  designType: DesignType;
  designTitle: string;
  config: ExperimentalConfig;
  traitStats: Record<string, TraitStats>;
  anovaResults: Record<string, AnovaResult>;
  postHocResults: Record<string, PostHocResult>;
  correlationMatrix?: CorrelationMatrix;
  regressionResults?: RegressionResult[];
}): string {
  const {
    designType, designTitle, config,
    traitStats, anovaResults, postHocResults,
    correlationMatrix, regressionResults,
  } = params;

  const sections: string[] = [];

  // عنوان
  sections.push(`## نتایج و بحث\n`);
  sections.push(
    `این آزمایش در قالب ${designTitle} با ${config.treatments} تیمار، ` +
    `${config.replications} تکرار برای ${config.traits.length} صفت مورد بررسی انجام شد.\n`
  );

  // بخش آمار توصیفی
  sections.push(`### ۱. آمار توصیفی\n`);
  config.traits.forEach(trait => {
    const s = traitStats[trait];
    if (s) sections.push(interpretDescriptive(s) + '\n');
  });

  // بخش تجزیه واریانس
  sections.push(`\n### ۲. تجزیه واریانس (ANOVA)\n`);
  config.traits.forEach(trait => {
    const a = anovaResults[trait];
    if (a) sections.push(interpretAnova(a, designType) + '\n');
  });

  // بخش مقایسه میانگین‌ها
  sections.push(`\n### ۳. مقایسه میانگین تیمارها\n`);
  config.traits.forEach(trait => {
    const ph = postHocResults[trait];
    if (ph) sections.push(interpretPostHoc(ph) + '\n');
  });

  // بخش همبستگی
  if (correlationMatrix && config.traits.length > 1) {
    sections.push(`\n### ۴. همبستگی بین صفات\n`);
    sections.push(interpretCorrelation(correlationMatrix) + '\n');
  }

  // بخش رگرسیون
  if (regressionResults && regressionResults.length > 0) {
    sections.push(`\n### ۵. تحلیل رگرسیون\n`);
    regressionResults.forEach(reg => {
      sections.push(interpretRegression(reg) + '\n');
    });
  }

  // نتیجه‌گیری
  sections.push(`\n### نتیجه‌گیری\n`);
  const sigTraits = config.traits.filter(t => {
    const a = anovaResults[t];
    return a?.sources.some(s =>
      s.significance !== 'ns' && s.fCalc > 0 &&
      !s.source.includes('کل') && !s.source.toLowerCase().includes('total') &&
      !s.source.includes('خطا') && !s.source.toLowerCase().includes('error') &&
      !s.source.includes('تکرار') && !s.source.toLowerCase().includes('rep')
    );
  });

  if (sigTraits.length > 0) {
    const best = sigTraits.map(t => {
      const ph = postHocResults[t];
      const topGroup = ph?.groups[0];
      return topGroup ? `در صفت ${t} تیمار ${topGroup.name} (${topGroup.mean.toFixed(4)})` : '';
    }).filter(Boolean).join('؛ ');
    sections.push(
      `بر اساس نتایج به‌دست‌آمده، تیمارها برای صفات ${sigTraits.join('، ')} تفاوت معنی‌داری نشان دادند. ` +
      `برترین تیمارها عبارتند از: ${best}.`
    );
  } else {
    sections.push('بر اساس نتایج حاصل، بین تیمارها در هیچ‌یک از صفات مورد بررسی تفاوت معنی‌داری مشاهده نشد.');
  }

  return sections.join('\n');
}
