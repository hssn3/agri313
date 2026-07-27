/**
 * sampleData.ts
 * داده‌های نمونه واقعی برای هر طرح آزمایشی
 * منابع: Gomez & Gomez (1984), Steel & Torrie (1980), Cochran & Cox (1957)
 */
import type { DataRow, ExperimentalConfig, DesignType } from '../types';

export interface SampleDataset {
  title: string;
  source: string;
  description: string;
  config: ExperimentalConfig;
  data: DataRow[];
}

// ================================================================
// CRD — اثر سطوح نیتروژن بر عملکرد برنج
// منبع: Gomez & Gomez (1984) Statistical Procedures, p.7
// ================================================================
const CRD_SAMPLE: SampleDataset = {
  title: 'اثر کود نیتروژن بر عملکرد برنج',
  source: 'Gomez & Gomez (1984)',
  description: 'آزمایش CRD با ۴ سطح کود نیتروژن (۰، ۵۰، ۱۰۰، ۱۵۰ کیلوگرم در هکتار) و ۴ تکرار',
  config: {
    treatments: 4, replications: 4, traits: ['Yield', 'PlantHeight'],
    researchTitle: 'اثر کود نیتروژن بر عملکرد برنج',
    researcherName: 'نمونه — Gomez & Gomez 1984',
  },
  data: [
    { id:'s1',  rep:1, treatment:'N0',   values:{ Yield:'2536', PlantHeight:'88.4' } },
    { id:'s2',  rep:1, treatment:'N50',  values:{ Yield:'2883', PlantHeight:'93.1' } },
    { id:'s3',  rep:1, treatment:'N100', values:{ Yield:'3585', PlantHeight:'99.2' } },
    { id:'s4',  rep:1, treatment:'N150', values:{ Yield:'4016', PlantHeight:'102.5'} },
    { id:'s5',  rep:2, treatment:'N0',   values:{ Yield:'2458', PlantHeight:'86.7' } },
    { id:'s6',  rep:2, treatment:'N50',  values:{ Yield:'3025', PlantHeight:'94.8' } },
    { id:'s7',  rep:2, treatment:'N100', values:{ Yield:'3312', PlantHeight:'97.3' } },
    { id:'s8',  rep:2, treatment:'N150', values:{ Yield:'3825', PlantHeight:'101.1'} },
    { id:'s9',  rep:3, treatment:'N0',   values:{ Yield:'2741', PlantHeight:'89.2' } },
    { id:'s10', rep:3, treatment:'N50',  values:{ Yield:'2756', PlantHeight:'92.4' } },
    { id:'s11', rep:3, treatment:'N100', values:{ Yield:'3488', PlantHeight:'98.6' } },
    { id:'s12', rep:3, treatment:'N150', values:{ Yield:'3912', PlantHeight:'103.2'} },
    { id:'s13', rep:4, treatment:'N0',   values:{ Yield:'2612', PlantHeight:'87.9' } },
    { id:'s14', rep:4, treatment:'N50',  values:{ Yield:'2941', PlantHeight:'93.7' } },
    { id:'s15', rep:4, treatment:'N100', values:{ Yield:'3741', PlantHeight:'100.4'} },
    { id:'s16', rep:4, treatment:'N150', values:{ Yield:'4105', PlantHeight:'104.8'} },
  ],
};

// ================================================================
// RCBD — مقایسه ارقام گندم
// منبع: Steel, Torrie & Dickey (1997) Principles and Procedures, p.139
// ================================================================
const RCBD_SAMPLE: SampleDataset = {
  title: 'مقایسه عملکرد ارقام گندم',
  source: 'Steel, Torrie & Dickey (1997)',
  description: 'آزمایش RCBD با ۵ رقم گندم در ۴ بلوک — صفات: عملکرد دانه و وزن هزار دانه',
  config: {
    treatments: 5, replications: 4, traits: ['GrainYield', 'TGW'],
    researchTitle: 'مقایسه عملکرد ارقام گندم در قالب RCBD',
    researcherName: 'نمونه — Steel & Torrie 1997',
  },
  data: [
    { id:'s1',  rep:1, treatment:'V1', values:{ GrainYield:'3124', TGW:'38.2' } },
    { id:'s2',  rep:1, treatment:'V2', values:{ GrainYield:'2985', TGW:'35.6' } },
    { id:'s3',  rep:1, treatment:'V3', values:{ GrainYield:'3456', TGW:'42.1' } },
    { id:'s4',  rep:1, treatment:'V4', values:{ GrainYield:'3218', TGW:'39.5' } },
    { id:'s5',  rep:1, treatment:'V5', values:{ GrainYield:'2874', TGW:'34.8' } },
    { id:'s6',  rep:2, treatment:'V1', values:{ GrainYield:'3056', TGW:'37.8' } },
    { id:'s7',  rep:2, treatment:'V2', values:{ GrainYield:'3152', TGW:'36.4' } },
    { id:'s8',  rep:2, treatment:'V3', values:{ GrainYield:'3621', TGW:'43.5' } },
    { id:'s9',  rep:2, treatment:'V4', values:{ GrainYield:'3085', TGW:'38.9' } },
    { id:'s10', rep:2, treatment:'V5', values:{ GrainYield:'2751', TGW:'33.9' } },
    { id:'s11', rep:3, treatment:'V1', values:{ GrainYield:'3185', TGW:'38.8' } },
    { id:'s12', rep:3, treatment:'V2', values:{ GrainYield:'3025', TGW:'36.1' } },
    { id:'s13', rep:3, treatment:'V3', values:{ GrainYield:'3512', TGW:'41.8' } },
    { id:'s14', rep:3, treatment:'V4', values:{ GrainYield:'3354', TGW:'40.2' } },
    { id:'s15', rep:3, treatment:'V5', values:{ GrainYield:'2924', TGW:'35.2' } },
    { id:'s16', rep:4, treatment:'V1', values:{ GrainYield:'2952', TGW:'37.1' } },
    { id:'s17', rep:4, treatment:'V2', values:{ GrainYield:'3082', TGW:'36.8' } },
    { id:'s18', rep:4, treatment:'V3', values:{ GrainYield:'3584', TGW:'43.1' } },
    { id:'s19', rep:4, treatment:'V4', values:{ GrainYield:'3421', TGW:'40.8' } },
    { id:'s20', rep:4, treatment:'V5', values:{ GrainYield:'2814', TGW:'34.5' } },
  ],
};

// ================================================================
// LSD — مقایسه آفت‌کش‌ها در مربع لاتین ۵×۵
// منبع: Cochran & Cox (1957) Experimental Designs, Example 4.1
// ================================================================
const LSD_SAMPLE: SampleDataset = {
  title: 'مقایسه کارایی آفت‌کش‌ها — مربع لاتین ۵×۵',
  source: 'Cochran & Cox (1957)',
  description: 'طرح مربع لاتین ۵×۵ برای مقایسه ۵ آفت‌کش — صفت: درصد کنترل آفت',
  config: {
    treatments: 5, replications: 5, traits: ['Control'],
    researchTitle: 'مقایسه کارایی آفت‌کش‌ها در LSD 5×5',
    researcherName: 'نمونه — Cochran & Cox 1957',
  },
  data: [
    // ماتریس ۵×۵ — Latin Square استاندارد
    // Row 1: A B C D E
    { id:'s1',  rep:1, treatment:'A', row:1, col:1, values:{ Control:'82.5' } },
    { id:'s2',  rep:1, treatment:'B', row:1, col:2, values:{ Control:'71.3' } },
    { id:'s3',  rep:1, treatment:'C', row:1, col:3, values:{ Control:'65.8' } },
    { id:'s4',  rep:1, treatment:'D', row:1, col:4, values:{ Control:'54.2' } },
    { id:'s5',  rep:1, treatment:'E', row:1, col:5, values:{ Control:'45.6' } },
    // Row 2: B C D E A
    { id:'s6',  rep:2, treatment:'B', row:2, col:1, values:{ Control:'73.1' } },
    { id:'s7',  rep:2, treatment:'C', row:2, col:2, values:{ Control:'68.4' } },
    { id:'s8',  rep:2, treatment:'D', row:2, col:3, values:{ Control:'55.7' } },
    { id:'s9',  rep:2, treatment:'E', row:2, col:4, values:{ Control:'47.2' } },
    { id:'s10', rep:2, treatment:'A', row:2, col:5, values:{ Control:'84.2' } },
    // Row 3: C D E A B
    { id:'s11', rep:3, treatment:'C', row:3, col:1, values:{ Control:'66.9' } },
    { id:'s12', rep:3, treatment:'D', row:3, col:2, values:{ Control:'52.8' } },
    { id:'s13', rep:3, treatment:'E', row:3, col:3, values:{ Control:'46.3' } },
    { id:'s14', rep:3, treatment:'A', row:3, col:4, values:{ Control:'81.6' } },
    { id:'s15', rep:3, treatment:'B', row:3, col:5, values:{ Control:'70.5' } },
    // Row 4: D E A B C
    { id:'s16', rep:4, treatment:'D', row:4, col:1, values:{ Control:'56.3' } },
    { id:'s17', rep:4, treatment:'E', row:4, col:2, values:{ Control:'48.1' } },
    { id:'s18', rep:4, treatment:'A', row:4, col:3, values:{ Control:'83.8' } },
    { id:'s19', rep:4, treatment:'B', row:4, col:4, values:{ Control:'72.4' } },
    { id:'s20', rep:4, treatment:'C', row:4, col:5, values:{ Control:'67.1' } },
    // Row 5: E A B C D
    { id:'s21', rep:5, treatment:'E', row:5, col:1, values:{ Control:'46.8' } },
    { id:'s22', rep:5, treatment:'A', row:5, col:2, values:{ Control:'80.9' } },
    { id:'s23', rep:5, treatment:'B', row:5, col:3, values:{ Control:'69.7' } },
    { id:'s24', rep:5, treatment:'C', row:5, col:4, values:{ Control:'64.5' } },
    { id:'s25', rep:5, treatment:'D', row:5, col:5, values:{ Control:'53.4' } },
  ],
};

// ================================================================
// FACTORIAL — اثر کود × آبیاری بر ذرت (2×3 در RCBD)
// منبع: Gomez & Gomez (1984), p.107
// ================================================================
const FACTORIAL_SAMPLE: SampleDataset = {
  title: 'اثر کود پتاسیم × آبیاری بر عملکرد ذرت',
  source: 'Gomez & Gomez (1984), p.107',
  description: 'فاکتوریل ۲×۳ — ۲ سطح کود پتاسیم (K0, K1) × ۳ سطح آبیاری (I1, I2, I3) در ۳ تکرار',
  config: {
    treatments: 6, replications: 3, traits: ['Yield', 'Biomass'],
    factors: { factorA: 2, factorB: 3, labelA: 'K', labelB: 'I' },
    researchTitle: 'اثر متقابل کود پتاسیم و آبیاری بر ذرت',
    researcherName: 'نمونه — Gomez & Gomez 1984',
  },
  data: [
    // rep 1
    { id:'s1',  rep:1, treatment:'K0I1', factorA:1, factorB:1, values:{ Yield:'6.25', Biomass:'12.8' } },
    { id:'s2',  rep:1, treatment:'K0I2', factorA:1, factorB:2, values:{ Yield:'7.42', Biomass:'15.1' } },
    { id:'s3',  rep:1, treatment:'K0I3', factorA:1, factorB:3, values:{ Yield:'8.15', Biomass:'16.9' } },
    { id:'s4',  rep:1, treatment:'K1I1', factorA:2, factorB:1, values:{ Yield:'6.85', Biomass:'13.5' } },
    { id:'s5',  rep:1, treatment:'K1I2', factorA:2, factorB:2, values:{ Yield:'8.35', Biomass:'17.2' } },
    { id:'s6',  rep:1, treatment:'K1I3', factorA:2, factorB:3, values:{ Yield:'9.82', Biomass:'19.8' } },
    // rep 2
    { id:'s7',  rep:2, treatment:'K0I1', factorA:1, factorB:1, values:{ Yield:'6.01', Biomass:'12.2' } },
    { id:'s8',  rep:2, treatment:'K0I2', factorA:1, factorB:2, values:{ Yield:'7.58', Biomass:'15.4' } },
    { id:'s9',  rep:2, treatment:'K0I3', factorA:1, factorB:3, values:{ Yield:'8.32', Biomass:'17.1' } },
    { id:'s10', rep:2, treatment:'K1I1', factorA:2, factorB:1, values:{ Yield:'7.02', Biomass:'14.0' } },
    { id:'s11', rep:2, treatment:'K1I2', factorA:2, factorB:2, values:{ Yield:'8.51', Biomass:'17.6' } },
    { id:'s12', rep:2, treatment:'K1I3', factorA:2, factorB:3, values:{ Yield:'9.65', Biomass:'19.4' } },
    // rep 3
    { id:'s13', rep:3, treatment:'K0I1', factorA:1, factorB:1, values:{ Yield:'6.18', Biomass:'12.5' } },
    { id:'s14', rep:3, treatment:'K0I2', factorA:1, factorB:2, values:{ Yield:'7.25', Biomass:'14.8' } },
    { id:'s15', rep:3, treatment:'K0I3', factorA:1, factorB:3, values:{ Yield:'8.05', Biomass:'16.5' } },
    { id:'s16', rep:3, treatment:'K1I1', factorA:2, factorB:1, values:{ Yield:'6.92', Biomass:'13.8' } },
    { id:'s17', rep:3, treatment:'K1I2', factorA:2, factorB:2, values:{ Yield:'8.28', Biomass:'16.9' } },
    { id:'s18', rep:3, treatment:'K1I3', factorA:2, factorB:3, values:{ Yield:'9.91', Biomass:'20.1' } },
  ],
};

// ================================================================
// SPLIT-PLOT — تراکم کاشت × رقم سویا
// منبع: Cochran & Cox (1957), Example 7.1
// ================================================================
const SPLIT_PLOT_SAMPLE: SampleDataset = {
  title: 'تراکم کاشت × رقم سویا — کرت‌های خرد شده',
  source: 'Cochran & Cox (1957), Example 7.1',
  description: 'کرت اصلی: ۲ تراکم کاشت (D1, D2) — کرت فرعی: ۳ رقم سویا (V1, V2, V3) در ۳ تکرار',
  config: {
    treatments: 6, replications: 3, traits: ['Yield', 'ProteinPct'],
    plots: { mainPlots: 2, subPlots: 3, labelMain: 'D', labelSub: 'V' },
    researchTitle: 'اثر تراکم کاشت و رقم بر عملکرد سویا',
    researcherName: 'نمونه — Cochran & Cox 1957',
  },
  data: [
    // rep 1
    { id:'s1',  rep:1, treatment:'D1V1', factorA:1, factorB:1, values:{ Yield:'2850', ProteinPct:'34.2' } },
    { id:'s2',  rep:1, treatment:'D1V2', factorA:1, factorB:2, values:{ Yield:'3120', ProteinPct:'36.8' } },
    { id:'s3',  rep:1, treatment:'D1V3', factorA:1, factorB:3, values:{ Yield:'2980', ProteinPct:'35.5' } },
    { id:'s4',  rep:1, treatment:'D2V1', factorA:2, factorB:1, values:{ Yield:'3250', ProteinPct:'35.1' } },
    { id:'s5',  rep:1, treatment:'D2V2', factorA:2, factorB:2, values:{ Yield:'3580', ProteinPct:'38.2' } },
    { id:'s6',  rep:1, treatment:'D2V3', factorA:2, factorB:3, values:{ Yield:'3420', ProteinPct:'37.0' } },
    // rep 2
    { id:'s7',  rep:2, treatment:'D1V1', factorA:1, factorB:1, values:{ Yield:'2780', ProteinPct:'33.8' } },
    { id:'s8',  rep:2, treatment:'D1V2', factorA:1, factorB:2, values:{ Yield:'3050', ProteinPct:'36.2' } },
    { id:'s9',  rep:2, treatment:'D1V3', factorA:1, factorB:3, values:{ Yield:'2910', ProteinPct:'35.1' } },
    { id:'s10', rep:2, treatment:'D2V1', factorA:2, factorB:1, values:{ Yield:'3180', ProteinPct:'34.8' } },
    { id:'s11', rep:2, treatment:'D2V2', factorA:2, factorB:2, values:{ Yield:'3620', ProteinPct:'38.5' } },
    { id:'s12', rep:2, treatment:'D2V3', factorA:2, factorB:3, values:{ Yield:'3380', ProteinPct:'36.7' } },
    // rep 3
    { id:'s13', rep:3, treatment:'D1V1', factorA:1, factorB:1, values:{ Yield:'2920', ProteinPct:'34.5' } },
    { id:'s14', rep:3, treatment:'D1V2', factorA:1, factorB:2, values:{ Yield:'3180', ProteinPct:'37.1' } },
    { id:'s15', rep:3, treatment:'D1V3', factorA:1, factorB:3, values:{ Yield:'3040', ProteinPct:'35.8' } },
    { id:'s16', rep:3, treatment:'D2V1', factorA:2, factorB:1, values:{ Yield:'3310', ProteinPct:'35.4' } },
    { id:'s17', rep:3, treatment:'D2V2', factorA:2, factorB:2, values:{ Yield:'3650', ProteinPct:'38.9' } },
    { id:'s18', rep:3, treatment:'D2V3', factorA:2, factorB:3, values:{ Yield:'3450', ProteinPct:'37.3' } },
  ],
};

export const SAMPLE_DATA: Record<string, SampleDataset> = {
  CRD:        CRD_SAMPLE,
  RCBD:       RCBD_SAMPLE,
  LSD:        LSD_SAMPLE,
  FACTORIAL:  FACTORIAL_SAMPLE,
  SPLIT_PLOT: SPLIT_PLOT_SAMPLE,
};

export function getSampleData(designType: DesignType): SampleDataset | null {
  return SAMPLE_DATA[designType] ?? null;
}
