/**
 * distributions.ts
 * محاسبه توزیع‌های آماری: F، t، q (studentized range)
 * بدون وابستگی به کتابخانه خارجی - فرمول‌های عددی دقیق
 */

// ============================================================
// تابع گاما لگاریتمی (Lanczos approximation)
// ============================================================
function lnGamma(x: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

export function gamma(x: number): number {
  return Math.exp(lnGamma(x));
}

// ============================================================
// تابع بتای ناکامل منظم شده - Regularized Incomplete Beta
// I(x; a, b) — با روش continued fraction (Lentz)
// ============================================================
function betacf(x: number, a: number, b: number): number {
  const MAXIT = 200;
  const EPS = 3.0e-7;
  const FPMIN = 1.0e-30;
  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) <= EPS) break;
  }
  return h;
}

export function incompleteBeta(x: number, a: number, b: number): number {
  if (x < 0 || x > 1) return NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
  const factor = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta);
  if (x < (a + 1) / (a + b + 2)) {
    return factor * betacf(x, a, b) / a;
  } else {
    return 1 - factor * betacf(1 - x, b, a) / b;
  }
}

// ============================================================
// توزیع F — CDF و p-value
// ============================================================
/** P(F <= x) با df1، df2 */
export function fCDF(x: number, df1: number, df2: number): number {
  if (x <= 0) return 0;
  const u = df1 * x / (df1 * x + df2);
  return incompleteBeta(u, df1 / 2, df2 / 2);
}

/** p-value یک‌طرفه (upper tail) برای آزمون F */
export function fPValue(f: number, df1: number, df2: number): number {
  if (!isFinite(f) || f < 0) return 1;
  return 1 - fCDF(f, df1, df2);
}

/**
 * مقدار بحرانی F با جستجوی دوتایی
 * F_crit(alpha, df1, df2): مقداری که P(F > x) = alpha
 */
export function fCritical(alpha: number, df1: number, df2: number): number {
  let lo = 0, hi = 1000;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (1 - fCDF(mid, df1, df2) > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ============================================================
// توزیع t — CDF و p-value (دوطرفه)
// ============================================================
export function tCDF(t: number, df: number): number {
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
}

export function tPValue2Tail(t: number, df: number): number {
  return 2 * (1 - tCDF(Math.abs(t), df));
}

export function tCritical(alpha: number, df: number): number {
  let lo = 0, hi = 50;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (tPValue2Tail(mid, df) > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ============================================================
// توزیع نرمال استاندارد
// ============================================================
export function normalCDF(z: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-(z * z) / 2);
  return 0.5 * (1 + sign * y);
}

export function normalPDF(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/** inverse normal CDF — برای Shapiro-Wilk */
export function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  // Beasley-Springer-Moro algorithm
  const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637];
  const b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833];
  const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209,
             0.0276438810333863, 0.0038405729373609, 0.0003951896511349,
             0.0000321767881768, 0.0000002888167364, 0.0000003960315187];
  const y = p - 0.5;
  if (Math.abs(y) < 0.42) {
    const r = y * y;
    return y * (((a[3] * r + a[2]) * r + a[1]) * r + a[0]) /
           ((((b[3] * r + b[2]) * r + b[1]) * r + b[0]) * r + 1);
  }
  const r = p < 0.5 ? Math.log(-Math.log(p)) : Math.log(-Math.log(1 - p));
  let x = c[0];
  for (let i = 1; i < 9; i++) x += c[i] * Math.pow(r, i);
  return p < 0.5 ? -x : x;
}

// ============================================================
// توزیع Studentized Range (q) — برای Duncan، Tukey
// روش: تقریب عددی از Lund & Lund (1983) / تقریب نرمال
// ============================================================
/**
 * جدول q بحرانی (studentized range) — جدول عددی کامل
 * q_table[alpha][k][v_index]
 * k = تعداد میانگین‌ها (2..10)
 * v = درجه آزادی خطا: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,24,30,40,60,120,Inf]
 */
const Q_DF = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,24,30,40,60,120,Infinity];

const Q_TABLE_05: Record<number, number[]> = {
  2:  [17.97,6.08,4.50,3.93,3.64,3.46,3.34,3.26,3.20,3.15,3.11,3.08,3.06,3.03,3.01,3.00,2.98,2.97,2.96,2.95,2.92,2.89,2.86,2.83,2.80,2.77],
  3:  [26.98,8.33,5.91,5.04,4.60,4.34,4.16,4.04,3.95,3.88,3.82,3.77,3.73,3.70,3.67,3.65,3.63,3.61,3.59,3.58,3.53,3.49,3.44,3.40,3.36,3.31],
  4:  [32.82,9.80,6.82,5.76,5.22,4.90,4.68,4.53,4.41,4.33,4.26,4.20,4.15,4.11,4.08,4.05,4.02,4.00,3.98,3.96,3.90,3.85,3.79,3.74,3.68,3.63],
  5:  [37.08,10.88,7.50,6.29,5.67,5.30,5.06,4.89,4.76,4.65,4.57,4.51,4.45,4.41,4.37,4.33,4.30,4.28,4.25,4.23,4.17,4.10,4.04,3.98,3.92,3.86],
  6:  [40.41,11.74,8.04,6.71,6.03,5.63,5.36,5.17,5.02,4.91,4.82,4.75,4.69,4.64,4.59,4.56,4.52,4.49,4.47,4.45,4.37,4.30,4.23,4.16,4.10,4.03],
  7:  [43.12,12.44,8.48,7.05,6.33,5.90,5.61,5.40,5.24,5.12,5.03,4.95,4.88,4.83,4.78,4.74,4.70,4.67,4.65,4.62,4.54,4.46,4.39,4.31,4.24,4.17],
  8:  [45.40,13.03,8.85,7.35,6.58,6.12,5.82,5.60,5.43,5.30,5.20,5.12,5.05,4.99,4.94,4.90,4.86,4.82,4.79,4.77,4.68,4.60,4.52,4.44,4.36,4.29],
  9:  [47.36,13.54,9.18,7.60,6.80,6.32,6.00,5.77,5.59,5.46,5.35,5.27,5.19,5.13,5.08,5.03,4.99,4.96,4.92,4.90,4.81,4.72,4.63,4.55,4.47,4.39],
  10: [49.07,13.99,9.46,7.83,6.99,6.49,6.16,5.92,5.74,5.60,5.49,5.39,5.32,5.25,5.20,5.15,5.11,5.07,5.04,5.01,4.92,4.82,4.73,4.65,4.56,4.47],
};

const Q_TABLE_01: Record<number, number[]> = {
  2:  [90.03,14.04,8.26,6.51,5.70,5.24,4.95,4.75,4.60,4.48,4.39,4.32,4.26,4.21,4.17,4.13,4.10,4.07,4.05,4.02,3.96,3.89,3.82,3.76,3.70,3.64],
  3:  [135.0,19.02,10.62,8.12,6.98,6.33,5.92,5.64,5.43,5.27,5.15,5.05,4.96,4.89,4.84,4.79,4.74,4.70,4.67,4.64,4.55,4.45,4.37,4.28,4.20,4.12],
  4:  [164.3,22.29,12.17,9.17,7.80,7.03,6.54,6.20,5.96,5.77,5.62,5.50,5.40,5.32,5.25,5.19,5.14,5.09,5.05,5.02,4.91,4.80,4.70,4.59,4.50,4.40],
  5:  [185.6,24.72,13.33,9.96,8.42,7.56,7.01,6.62,6.35,6.14,5.97,5.84,5.73,5.63,5.56,5.49,5.43,5.38,5.33,5.29,5.17,5.05,4.93,4.82,4.71,4.60],
  6:  [202.2,26.63,14.24,10.58,8.91,7.97,7.37,6.96,6.66,6.43,6.25,6.10,5.98,5.88,5.80,5.72,5.66,5.60,5.55,5.51,5.37,5.24,5.11,4.99,4.87,4.76],
  7:  [215.8,28.20,15.00,11.10,9.32,8.32,7.68,7.24,6.91,6.67,6.48,6.32,6.19,6.08,5.99,5.92,5.85,5.79,5.73,5.69,5.54,5.40,5.26,5.13,5.01,4.88],
  8:  [227.2,29.53,15.64,11.55,9.67,8.61,7.94,7.47,7.13,6.87,6.67,6.51,6.37,6.26,6.16,6.08,6.01,5.94,5.89,5.84,5.69,5.54,5.39,5.25,5.12,4.99],
  9:  [237.0,30.68,16.20,11.93,9.97,8.87,8.17,7.68,7.33,7.05,6.84,6.67,6.53,6.41,6.31,6.22,6.15,6.08,6.02,5.97,5.81,5.65,5.50,5.36,5.21,5.08],
  10: [245.6,31.69,16.69,12.27,10.24,9.10,8.37,7.86,7.49,7.21,6.99,6.81,6.67,6.54,6.44,6.35,6.27,6.20,6.14,6.09,5.92,5.76,5.60,5.45,5.30,5.16],
};

function interpolateQ(table: Record<number, number[]>, k: number, v: number): number {
  const kClamped = Math.min(10, Math.max(2, Math.round(k)));
  const row = table[kClamped];
  if (v >= 120) return row[25];
  if (v <= 1) return row[0];
  // linear interpolation در درجات آزادی
  for (let i = 0; i < Q_DF.length - 1; i++) {
    if (v >= Q_DF[i] && v <= Q_DF[i + 1]) {
      const t = (v - Q_DF[i]) / (Q_DF[i + 1] - Q_DF[i]);
      return row[i] + t * (row[i + 1] - row[i]);
    }
  }
  return row[row.length - 1];
}

/** مقدار بحرانی q در سطح alpha برای k میانگین و v درجه آزادی خطا */
export function qCritical(alpha: number, k: number, v: number): number {
  if (alpha <= 0.01) return interpolateQ(Q_TABLE_01, k, v);
  return interpolateQ(Q_TABLE_05, k, v);
}
