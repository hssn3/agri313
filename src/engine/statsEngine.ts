/**
 * statsEngine.ts
 * موتور محاسبات آماری کامل برای طرح‌های آزمایشی کشاورزی
 * شامل: ANOVA (5 طرح)، Post-hoc، Shapiro-Wilk، Correlation، Regression
 */

import { fCritical, fPValue, qCritical, normalQuantile, tCritical } from './distributions';
import type {
  DataRow, ExperimentalConfig,
  TraitStats, AnovaResult, AnovaSource,
  PostHocResult, MeanGroup, ComparisonMethod,
  CorrelationMatrix, RegressionResult,
} from '../types';

// ============================================================
// کمک‌ها
// ============================================================
function getValues(data: DataRow[], trait: string): number[] {
  return data.map(r => parseFloat(r.values[trait])).filter(v => !isNaN(v));
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function getSig(f: number, df1: number, df2: number): 'ns' | '*' | '**' {
  const f05 = fCritical(0.05, df1, df2);
  const f01 = fCritical(0.01, df1, df2);
  if (f > f01) return '**';
  if (f > f05) return '*';
  return 'ns';
}

// ============================================================
// آمار توصیفی + Shapiro-Wilk
// ============================================================
export class StatsEngine {

  /** آمار توصیفی برای هر صفت */
  static calculateStats(data: DataRow[], traits: string[]): Record<string, TraitStats> {
    const out: Record<string, TraitStats> = {};
    traits.forEach(trait => {
      const vals = getValues(data, trait);
      if (vals.length < 3) return;
      const n = vals.length;
      const mu = mean(vals);
      const variance = vals.reduce((s, v) => s + (v - mu) ** 2, 0) / (n - 1);
      const sd = Math.sqrt(variance);
      const cv = mu !== 0 ? (sd / Math.abs(mu)) * 100 : 0;
      const skew = n >= 3
        ? (vals.reduce((s, v) => s + (v - mu) ** 3, 0) / n) / (sd ** 3 || 1)
        : 0;
      const kurt = n >= 4
        ? (vals.reduce((s, v) => s + (v - mu) ** 4, 0) / n) / (variance ** 2 || 1) - 3
        : 0;
      const sw = StatsEngine.shapiroWilk(vals);
      out[trait] = {
        traitName: trait,
        n, mean: mu, variance, stdDev: sd, cv,
        skewness: skew, kurtosis: kurt,
        min: Math.min(...vals), max: Math.max(...vals),
        swW: sw.W, swPValue: sw.pValue,
        isNormal: sw.pValue > 0.05,
      };
    });
    return out;
  }

  /** آزمون نرمالیته Shapiro-Wilk — Royston (1982) approximation */
  static shapiroWilk(x: number[]): { W: number; pValue: number } {
    const n = x.length;
    if (n < 3) return { W: 1, pValue: 1 };
    const sorted = [...x].sort((a, b) => a - b);
    const mu = mean(sorted);
    const SS = sorted.reduce((s, v) => s + (v - mu) ** 2, 0);
    if (SS === 0) return { W: 1, pValue: 1 };

    // ضرایب a_i از تقریب Royston — برای n تا 50
    const halfN = Math.floor(n / 2);
    const m: number[] = sorted.map((_, i) => normalQuantile((i + 1 - 0.375) / (n + 0.25)));
    const mSS = m.reduce((s, v) => s + v * v, 0);
    const cn = m[n - 1] / Math.sqrt(mSS);
    const a: number[] = new Array(n).fill(0);
    a[n - 1] = cn;
    a[0] = -cn;

    // تقریب a_i از فرمول Shapiro-Francia برای بقیه
    const phi = (mSS - 2 * m[n - 1] ** 2) / (1 - 2 * cn * cn);
    for (let i = 1; i < halfN; i++) {
      a[n - 1 - i] = m[n - 1 - i] / Math.sqrt(phi);
      a[i] = -a[n - 1 - i];
    }

    let b = 0;
    for (let i = 0; i < n; i++) b += a[i] * sorted[i];
    const W = Math.min(1, (b * b) / SS);

    // تقریب p-value از Royston (1992): log(1-W) ~ normal
    let pValue: number;
    if (n <= 11) {
      const gamma = -2.273 + 0.459 * n;
      const lnW = Math.log(1 - W);
      const mu_ln = -1.2725 + 1.0521 * Math.log(n);
      const sig_ln = 1.0308 - 0.26763 * Math.log(n);
      const z = (lnW - mu_ln) / sig_ln;
      pValue = 1 - (0.5 * (1 + erf(z / Math.SQRT2)));
      pValue = Math.min(1, Math.max(0.001, pValue));
    } else {
      const y = Math.log(1 - W);
      const mu_y = 0.0038915 * Math.pow(Math.log(n), 3) - 0.083751 * Math.pow(Math.log(n), 2) - 0.31082 * Math.log(n) - 1.5861;
      const sig_y = Math.exp(0.0030302 * Math.pow(Math.log(n), 2) - 0.082676 * Math.log(n) - 0.4803);
      const z = (y - mu_y) / sig_y;
      pValue = 1 - normalCDFApprox(z);
      pValue = Math.min(1, Math.max(0.001, pValue));
    }
    return { W: Math.round(W * 100000) / 100000, pValue: Math.round(pValue * 10000) / 10000 };
  }

  /** تبدیل داده برای نرمال‌سازی */
  static transformData(data: DataRow[], trait: string, type: 'log' | 'sqrt' | 'arcsin'): DataRow[] {
    return data.map(row => {
      const v = parseFloat(row.values[trait]);
      if (isNaN(v)) return row;
      let nv: number;
      if (type === 'log') nv = Math.log10(v + 1);
      else if (type === 'sqrt') nv = Math.sqrt(v + 0.5);
      else {
        const p = Math.max(0, Math.min(100, v)) / 100;
        nv = Math.asin(Math.sqrt(p)) * (180 / Math.PI);
      }
      return { ...row, values: { ...row.values, [trait]: nv.toFixed(6) } };
    });
  }

  // ==========================================================
  // ANOVA — طرح CRD
  // ==========================================================
  static crdAnova(data: DataRow[], traits: string[]): Record<string, AnovaResult> {
    const out: Record<string, AnovaResult> = {};
    traits.forEach(trait => {
      const groups: Record<string, number[]> = {};
      data.forEach(r => {
        const v = parseFloat(r.values[trait]);
        if (!isNaN(v)) {
          if (!groups[r.treatment]) groups[r.treatment] = [];
          groups[r.treatment].push(v);
        }
      });
      const tKeys = Object.keys(groups);
      const t = tKeys.length;
      const all: number[] = tKeys.flatMap(k => groups[k]);
      const N = all.length;
      if (N < 4 || t < 2) return;
      const G = sum(all);
      const CF = G * G / N;
      const SST = all.reduce((s, v) => s + v * v, 0) - CF;
      const SStr = tKeys.reduce((s, k) => {
        const sm = sum(groups[k]);
        return s + sm * sm / groups[k].length;
      }, 0) - CF;
      const SSE = SST - SStr;
      const dfTr = t - 1, dfE = N - t, dfTot = N - 1;
      const msTr = SStr / dfTr, msE = SSE / dfE;
      const F = msE > 0 ? msTr / msE : 0;
      out[trait] = {
        traitName: trait,
        sources: [
          makeSource('تیمار (Treatment)', dfTr, SStr, msTr, F, dfTr, dfE),
          errorRow(dfE, SSE, msE),
          totalRow(dfTot, SST),
        ],
      };
    });
    return out;
  }

  // ==========================================================
  // ANOVA — طرح RCBD
  // ==========================================================
  static rcbdAnova(data: DataRow[], traits: string[], cfg: ExperimentalConfig): Record<string, AnovaResult> {
    const out: Record<string, AnovaResult> = {};
    const t = cfg.treatments, r = cfg.replications, N = t * r;
    traits.forEach(trait => {
      const vals = data.map(d => ({ v: parseFloat(d.values[trait]), t: d.treatment, r: d.rep }))
                       .filter(d => !isNaN(d.v));
      if (vals.length < 4) return;
      const G = sum(vals.map(d => d.v));
      const CF = G * G / N;
      const SST = vals.reduce((s, d) => s + d.v * d.v, 0) - CF;
      const treatTotals: Record<string, number[]> = {};
      vals.forEach(d => { if (!treatTotals[d.t]) treatTotals[d.t] = []; treatTotals[d.t].push(d.v); });
      const SStr = Object.values(treatTotals).reduce((s, arr) => {
        const sm = sum(arr); return s + sm * sm / arr.length;
      }, 0) - CF;
      const blockTotals: Record<number, number[]> = {};
      vals.forEach(d => { if (!blockTotals[d.r]) blockTotals[d.r] = []; blockTotals[d.r].push(d.v); });
      const SSB = Object.values(blockTotals).reduce((s, arr) => {
        const sm = sum(arr); return s + sm * sm / arr.length;
      }, 0) - CF;
      const SSE = SST - SStr - SSB;
      const dfTr = t - 1, dfB = r - 1, dfE = dfTr * dfB, dfTot = N - 1;
      const msTr = SStr / dfTr, msB = SSB / dfB, msE = Math.max(0, SSE) / dfE;
      const fTr = msE > 0 ? msTr / msE : 0;
      const fB = msE > 0 ? msB / msE : 0;
      out[trait] = {
        traitName: trait,
        sources: [
          makeSource('تیمار (Treatment)', dfTr, SStr, msTr, fTr, dfTr, dfE),
          makeSource('بلوک (Block)', dfB, SSB, msB, fB, dfB, dfE),
          errorRow(dfE, Math.max(0, SSE), msE),
          totalRow(dfTot, SST),
        ],
      };
    });
    return out;
  }

  // ==========================================================
  // ANOVA — طرح LSD (مربع لاتین)
  // ==========================================================
  static lsdAnova(data: DataRow[], traits: string[], cfg: ExperimentalConfig): Record<string, AnovaResult> {
    const out: Record<string, AnovaResult> = {};
    const t = cfg.treatments, N = t * t;
    traits.forEach(trait => {
      const vals = data.map(d => ({ v: parseFloat(d.values[trait]), tr: d.treatment, row: d.row ?? 0, col: d.col ?? 0 }))
                       .filter(d => !isNaN(d.v));
      if (vals.length < 4) return;
      const G = sum(vals.map(d => d.v));
      const CF = G * G / N;
      const SST = vals.reduce((s, d) => s + d.v * d.v, 0) - CF;
      const tTotals: Record<string, number[]> = {};
      vals.forEach(d => { if (!tTotals[d.tr]) tTotals[d.tr] = []; tTotals[d.tr].push(d.v); });
      const SStr = Object.values(tTotals).reduce((s, arr) => s + sum(arr) ** 2 / t, 0) - CF;
      const rTotals: Record<number, number[]> = {};
      vals.forEach(d => { if (!rTotals[d.row]) rTotals[d.row] = []; rTotals[d.row].push(d.v); });
      const SSR = Object.values(rTotals).reduce((s, arr) => s + sum(arr) ** 2 / t, 0) - CF;
      const cTotals: Record<number, number[]> = {};
      vals.forEach(d => { if (!cTotals[d.col]) cTotals[d.col] = []; cTotals[d.col].push(d.v); });
      const SSC = Object.values(cTotals).reduce((s, arr) => s + sum(arr) ** 2 / t, 0) - CF;
      const SSE = SST - SStr - SSR - SSC;
      const dfTr = t - 1, dfR = t - 1, dfC = t - 1, dfE = (t - 1) * (t - 2), dfTot = N - 1;
      const msTr = SStr / dfTr, msR = SSR / dfR, msC = SSC / dfC;
      const msE = dfE > 0 ? Math.max(0, SSE) / dfE : 0;
      const fTr = msE > 0 ? msTr / msE : 0;
      out[trait] = {
        traitName: trait,
        sources: [
          makeSource('تیمار (Treatment)', dfTr, SStr, msTr, fTr, dfTr, dfE),
          makeSource('ردیف (Row)', dfR, SSR, msR, msE > 0 ? msR / msE : 0, dfR, dfE),
          makeSource('ستون (Column)', dfC, SSC, msC, msE > 0 ? msC / msE : 0, dfC, dfE),
          errorRow(dfE, Math.max(0, SSE), msE),
          totalRow(dfTot, SST),
        ],
      };
    });
    return out;
  }

  // ==========================================================
  // ANOVA — طرح فاکتوریل (a×b در RCBD)
  // ==========================================================
  static factorialAnova(data: DataRow[], traits: string[], cfg: ExperimentalConfig): Record<string, AnovaResult> {
    const out: Record<string, AnovaResult> = {};
    const a = cfg.factors?.factorA ?? 2, b = cfg.factors?.factorB ?? 2, r = cfg.replications;
    const N = a * b * r;
    traits.forEach(trait => {
      const vals = data.map(d => ({ v: parseFloat(d.values[trait]), fa: d.factorA ?? 1, fb: d.factorB ?? 1, rep: d.rep }))
                       .filter(d => !isNaN(d.v));
      if (vals.length < 4) return;
      const G = sum(vals.map(d => d.v));
      const CF = G * G / N;
      const SST = vals.reduce((s, d) => s + d.v * d.v, 0) - CF;
      const aSums: Record<number, number> = {};
      vals.forEach(d => { aSums[d.fa] = (aSums[d.fa] ?? 0) + d.v; });
      const SSA = Object.values(aSums).reduce((s, sm) => s + sm * sm / (b * r), 0) - CF;
      const bSums: Record<number, number> = {};
      vals.forEach(d => { bSums[d.fb] = (bSums[d.fb] ?? 0) + d.v; });
      const SSB = Object.values(bSums).reduce((s, sm) => s + sm * sm / (a * r), 0) - CF;
      const abSums: Record<string, number> = {};
      vals.forEach(d => { const k = `${d.fa}_${d.fb}`; abSums[k] = (abSums[k] ?? 0) + d.v; });
      const SSAB = Object.values(abSums).reduce((s, sm) => s + sm * sm / r, 0) - CF - SSA - SSB;
      const repSums: Record<number, number> = {};
      vals.forEach(d => { repSums[d.rep] = (repSums[d.rep] ?? 0) + d.v; });
      const SSRep = Object.values(repSums).reduce((s, sm) => s + sm * sm / (a * b), 0) - CF;
      const SSE = SST - SSA - SSB - SSAB - SSRep;
      const dfA = a - 1, dfB = b - 1, dfAB = (a - 1) * (b - 1), dfRep = r - 1;
      const dfE = (a * b - 1) * (r - 1), dfTot = N - 1;
      const msA = SSA / dfA, msB = SSB / dfB, msAB = SSAB / dfAB;
      const msRep = SSRep / dfRep, msE = Math.max(0, SSE) / dfE;
      const fA = msE > 0 ? msA / msE : 0, fB = msE > 0 ? msB / msE : 0;
      const fAB = msE > 0 ? msAB / msE : 0, fRep = msE > 0 ? msRep / msE : 0;
      out[trait] = {
        traitName: trait,
        sources: [
          makeSource('تکرار (Replication)', dfRep, SSRep, msRep, fRep, dfRep, dfE),
          makeSource('فاکتور A', dfA, SSA, msA, fA, dfA, dfE),
          makeSource('فاکتور B', dfB, SSB, msB, fB, dfB, dfE),
          makeSource('اثر متقابل A×B', dfAB, SSAB, msAB, fAB, dfAB, dfE),
          errorRow(dfE, Math.max(0, SSE), msE),
          totalRow(dfTot, SST),
        ],
      };
    });
    return out;
  }

  // ==========================================================
  // ANOVA — طرح کرت‌های خرد شده (Split-Plot)
  // ==========================================================
  static splitPlotAnova(data: DataRow[], traits: string[], cfg: ExperimentalConfig): Record<string, AnovaResult> {
    const out: Record<string, AnovaResult> = {};
    const a = cfg.plots?.mainPlots ?? 2, b = cfg.plots?.subPlots ?? 2, r = cfg.replications;
    const N = a * b * r;
    traits.forEach(trait => {
      const vals = data.map(d => ({ v: parseFloat(d.values[trait]), fa: d.factorA ?? 1, fb: d.factorB ?? 1, rep: d.rep }))
                       .filter(d => !isNaN(d.v));
      if (vals.length < 4) return;
      const G = sum(vals.map(d => d.v));
      const CF = G * G / N;
      const SST = vals.reduce((s, d) => s + d.v * d.v, 0) - CF;
      const repSums: Record<number, number> = {};
      vals.forEach(d => { repSums[d.rep] = (repSums[d.rep] ?? 0) + d.v; });
      const SSRep = Object.values(repSums).reduce((s, sm) => s + sm * sm / (a * b), 0) - CF;
      const aSums: Record<number, number> = {};
      vals.forEach(d => { aSums[d.fa] = (aSums[d.fa] ?? 0) + d.v; });
      const SSA = Object.values(aSums).reduce((s, sm) => s + sm * sm / (b * r), 0) - CF;
      const arSums: Record<string, number> = {};
      vals.forEach(d => { const k = `${d.fa}_${d.rep}`; arSums[k] = (arSums[k] ?? 0) + d.v; });
      const SS_AR = Object.values(arSums).reduce((s, sm) => s + sm * sm / b, 0) - CF;
      const SSEa = SS_AR - SSRep - SSA;
      const bSums: Record<number, number> = {};
      vals.forEach(d => { bSums[d.fb] = (bSums[d.fb] ?? 0) + d.v; });
      const SSB = Object.values(bSums).reduce((s, sm) => s + sm * sm / (a * r), 0) - CF;
      const abSums: Record<string, number> = {};
      vals.forEach(d => { const k = `${d.fa}_${d.fb}`; abSums[k] = (abSums[k] ?? 0) + d.v; });
      const SSAB = Object.values(abSums).reduce((s, sm) => s + sm * sm / r, 0) - CF - SSA - SSB;
      const SSEb = SST - SSRep - SSA - Math.max(0, SSEa) - SSB - SSAB;
      const dfRep = r - 1, dfA = a - 1, dfEa = (r - 1) * (a - 1);
      const dfB = b - 1, dfAB = (a - 1) * (b - 1), dfEb = a * (r - 1) * (b - 1), dfTot = N - 1;
      const msRep = SSRep / dfRep, msA = SSA / dfA, msEa = Math.max(0, SSEa) / dfEa;
      const msB = SSB / dfB, msAB = SSAB / dfAB, msEb = Math.max(0, SSEb) / dfEb;
      const fA = msEa > 0 ? msA / msEa : 0, fB = msEb > 0 ? msB / msEb : 0;
      const fAB = msEb > 0 ? msAB / msEb : 0;
      out[trait] = {
        traitName: trait,
        sources: [
          makeSource('تکرار (Replication)', dfRep, SSRep, msRep, 0, dfRep, dfEb),
          makeSource('فاکتور اصلی A (Main-Plot)', dfA, SSA, msA, fA, dfA, dfEa),
          errorRow(dfEa, Math.max(0, SSEa), msEa, 'خطای الف (Error a)'),
          makeSource('فاکتور فرعی B (Sub-Plot)', dfB, SSB, msB, fB, dfB, dfEb),
          makeSource('اثر متقابل A×B', dfAB, SSAB, msAB, fAB, dfAB, dfEb),
          errorRow(dfEb, Math.max(0, SSEb), msEb, 'خطای ب (Error b)'),
          totalRow(dfTot, SST),
        ],
      };
    });
    return out;
  }

  // ==========================================================
  // Post-Hoc: Duncan، Tukey، LSD
  // ==========================================================
  static postHoc(
    data: DataRow[], trait: string,
    anova: AnovaResult, method: ComparisonMethod,
    cfg: ExperimentalConfig,
  ): PostHocResult {
    const errSrc = anova.sources.find(s =>
      s.source.includes('خطای ب') || s.source.includes('Error b') ||
      s.source.includes('خطا') || s.source.toLowerCase().includes('error')
    );
    const treatSrc = anova.sources.find(s =>
      s.source.includes('تیمار') || s.source.includes('Treatment') ||
      s.source.includes('فاکتور اصلی')
    );
    const mse = errSrc?.ms ?? 1;
    const dfE = errSrc?.df ?? 1;
    const isSignificant = treatSrc ? treatSrc.significance !== 'ns' : false;

    // محاسبه میانگین تیمارها
    const tMeans: Record<string, number[]> = {};
    data.forEach(d => {
      const v = parseFloat(d.values[trait]);
      if (!isNaN(v)) {
        if (!tMeans[d.treatment]) tMeans[d.treatment] = [];
        tMeans[d.treatment].push(v);
      }
    });
    const r = cfg.replications;
    const meansList = Object.keys(tMeans).map(k => ({
      name: k,
      mean: mean(tMeans[k]),
      n: tMeans[k].length,
    })).sort((a, b) => b.mean - a.mean);

    const k = meansList.length;
    const seD = Math.sqrt(2 * mse / r);  // standard error of difference
    const groups = StatsEngine._assignLetters(meansList, mse, dfE, r, method, k);
    return { traitName: trait, method, groups, isSignificant, mse, dfE };
  }

  private static _assignLetters(
    means: { name: string; mean: number; n: number }[],
    mse: number, dfE: number, r: number,
    method: ComparisonMethod, k: number,
  ): MeanGroup[] {
    const n = means.length;
    // ماتریس معنی‌دار بودن تفاوت‌ها
    const sig: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const diff = Math.abs(means[i].mean - means[j].mean);
        const span = j - i + 1;
        const crit = StatsEngine._critDiff(span, mse, dfE, r, method, k);
        sig[i][j] = sig[j][i] = diff > crit;
      }
    }
    // تخصیص حروف — compact letter display
    const letters: string[][] = Array.from({ length: n }, () => []);
    const alpha = 'abcdefghijklmnopqrstuvwxyz';
    let li = 0;
    for (let i = 0; i < n; i++) {
      if (letters[i].length > 0) continue;
      const letter = alpha[li++ % 26];
      letters[i].push(letter);
      for (let j = i + 1; j < n; j++) {
        if (!sig[i][j]) letters[j].push(letter);
      }
    }
    return means.map((m, idx) => ({
      name: m.name,
      mean: m.mean,
      letter: letters[idx].sort().join('') || 'a',
    }));
  }

  private static _critDiff(
    span: number, mse: number, dfE: number,
    r: number, method: ComparisonMethod, k: number,
  ): number {
    const se = Math.sqrt(mse / r);
    if (method === 'DUNCAN') {
      // protected alpha: α_r = 1 - (1-0.05)^(r-1)
      const alphaR = 1 - Math.pow(0.95, span - 1);
      const q = qCritical(alphaR, span, dfE);
      return q * se;
    }
    if (method === 'TUKEY') {
      const q = qCritical(0.05, k, dfE);
      return q * se;
    }
    // LSD
    const t = tCritical(0.05, dfE);
    return t * Math.sqrt(2 * mse / r);
  }

  // ==========================================================
  // ماتریس همبستگی پیرسون
  // ==========================================================
  static correlationMatrix(data: DataRow[], traits: string[]): CorrelationMatrix {
    const matrix: CorrelationMatrix['matrix'] = {};
    traits.forEach(t1 => {
      matrix[t1] = {};
      traits.forEach(t2 => {
        if (t1 === t2) { matrix[t1][t2] = { r: 1, significance: 'ns', pValue: 1 }; return; }
        const v1 = getValues(data, t1), v2 = getValues(data, t2);
        const n = Math.min(v1.length, v2.length);
        if (n < 3) { matrix[t1][t2] = { r: 0, significance: 'ns', pValue: 1 }; return; }
        const m1 = mean(v1.slice(0, n)), m2 = mean(v2.slice(0, n));
        let num = 0, d1 = 0, d2 = 0;
        for (let i = 0; i < n; i++) {
          num += (v1[i] - m1) * (v2[i] - m2);
          d1 += (v1[i] - m1) ** 2;
          d2 += (v2[i] - m2) ** 2;
        }
        const r = (d1 * d2) > 0 ? num / Math.sqrt(d1 * d2) : 0;
        const t = Math.abs(r) * Math.sqrt((n - 2) / (1 - r * r + 1e-10));
        const p = 2 * (1 - tCDF_approx(t, n - 2));
        const sig: 'ns' | '*' | '**' = p < 0.01 ? '**' : p < 0.05 ? '*' : 'ns';
        matrix[t1][t2] = { r: Math.round(r * 10000) / 10000, significance: sig, pValue: Math.round(p * 10000) / 10000 };
      });
    });
    return { traits, matrix };
  }

  // ==========================================================
  // رگرسیون خطی ساده
  // ==========================================================
  static regression(data: DataRow[], xTrait: string, yTrait: string): RegressionResult {
    const xv = getValues(data, xTrait), yv = getValues(data, yTrait);
    const n = Math.min(xv.length, yv.length);
    const mx = mean(xv.slice(0, n)), my = mean(yv.slice(0, n));
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) {
      sxy += (xv[i] - mx) * (yv[i] - my);
      sxx += (xv[i] - mx) ** 2;
      syy += (yv[i] - my) ** 2;
    }
    const slope = sxx > 0 ? sxy / sxx : 0;
    const intercept = my - slope * mx;
    const r2 = (sxx * syy) > 0 ? (sxy ** 2) / (sxx * syy) : 0;
    return {
      independentTrait: xTrait, dependentTrait: yTrait,
      slope: Math.round(slope * 100000) / 100000,
      intercept: Math.round(intercept * 100000) / 100000,
      rSquare: Math.round(r2 * 10000) / 10000,
      equation: `ŷ = ${intercept.toFixed(4)} + ${slope.toFixed(4)}x`,
    };
  }
} // end class StatsEngine

// ============================================================
// Helper functions (module-level)
// ============================================================
function makeSource(
  source: string, df: number, ss: number, ms: number,
  f: number, df1: number, df2: number,
): AnovaSource {
  return {
    source, df,
    ss: Math.round(ss * 10000) / 10000,
    ms: Math.round(ms * 10000) / 10000,
    fCalc: Math.round(f * 10000) / 10000,
    fTab05: fCritical(0.05, df1, df2),
    fTab01: fCritical(0.01, df1, df2),
    significance: getSig(f, df1, df2),
    pValue: fPValue(f, df1, df2),
  };
}

function errorRow(df: number, ss: number, ms: number, label = 'خطا (Error)'): AnovaSource {
  return { source: label, df, ss: Math.round(ss * 10000) / 10000, ms: Math.round(ms * 10000) / 10000, fCalc: 0, fTab05: 0, fTab01: 0, significance: 'ns', pValue: 1 };
}

function totalRow(df: number, ss: number): AnovaSource {
  return { source: 'کل (Total)', df, ss: Math.round(ss * 10000) / 10000, ms: 0, fCalc: 0, fTab05: 0, fTab01: 0, significance: 'ns', pValue: 1 };
}

function erf(x: number): number {
  const t = 1 / (1 + 0.47047 * Math.abs(x));
  const poly = t * (0.3480242 + t * (-0.0958798 + t * 0.7478556));
  const val = 1 - poly * Math.exp(-(x * x));
  return x >= 0 ? val : -val;
}

function normalCDFApprox(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function tCDF_approx(t: number, df: number): number {
  // تقریب از beta ناکامل — inline import برای ESM
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBetaInline(x, df / 2, 0.5);
}

// نسخه inline از incompleteBeta برای جلوگیری از circular import
function incompleteBetaInline(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = lnGammaInline(a) + lnGammaInline(b) - lnGammaInline(a + b);
  const factor = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta);
  const MAXIT = 100, EPS = 3e-7, FPMIN = 1e-30;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d; let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) <= EPS) break;
  }
  if (x < (a + 1) / (a + b + 2)) return factor * h / a;
  return 1 - factor * h / b;
}

function lnGammaInline(x: number): number {
  const c = [0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGammaInline(1 - x);
  x -= 1; let a = c[0]; const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
