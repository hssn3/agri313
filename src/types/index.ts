/**
 * types/index.ts — تمام تایپ‌های مشترک پروژه
 */

export enum DesignType {
  CRD = 'CRD',
  RCBD = 'RCBD',
  LSD = 'LSD',
  FACTORIAL = 'FACTORIAL',
  SPLIT_PLOT = 'SPLIT_PLOT',
}

export type ComparisonMethod = 'DUNCAN' | 'TUKEY' | 'LSD';

export interface DesignInfo {
  id: DesignType;
  title: string;
  englishTitle: string;
  abbreviation: string;
  description: string;
  icon: string; // emoji or icon name
  color: string;
}

export interface ExperimentalConfig {
  treatments: number;
  replications: number;
  traits: string[];
  traitLabels?: Record<string, string>; // نام فارسی صفات
  factors?: { factorA: number; factorB: number; labelA?: string; labelB?: string };
  plots?: { mainPlots: number; subPlots: number; labelMain?: string; labelSub?: string };
  researchTitle?: string;
  researcherName?: string;
  location?: string;
  year?: string;
}

export interface DataRow {
  id: string;
  rep: number;
  treatment: string;
  values: Record<string, string>;
  subPlot?: number;
  mainPlot?: number;
  factorA?: number;
  factorB?: number;
  row?: number;
  col?: number;
}

export interface TraitStats {
  traitName: string;
  n: number;
  mean: number;
  variance: number;
  stdDev: number;
  cv: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  swW: number;
  swPValue: number;
  isNormal: boolean;
}

export interface AnovaSource {
  source: string;
  df: number;
  ss: number;
  ms: number;
  fCalc: number;
  fTab05: number;
  fTab01: number;
  significance: 'ns' | '*' | '**';
  pValue: number;
}

export interface AnovaResult {
  traitName: string;
  sources: AnovaSource[];
}

export interface MeanGroup {
  name: string;
  mean: number;
  letter: string;
}

export interface PostHocResult {
  traitName: string;
  method: ComparisonMethod;
  groups: MeanGroup[];
  isSignificant: boolean;
  mse: number;
  dfE: number;
}

export interface CorrelationMatrix {
  traits: string[];
  matrix: Record<string, Record<string, { r: number; significance: 'ns' | '*' | '**'; pValue: number }>>;
}

export interface RegressionResult {
  independentTrait: string;
  dependentTrait: string;
  slope: number;
  intercept: number;
  rSquare: number;
  equation: string;
}

export interface AnalysisResult {
  traitStats: Record<string, TraitStats>;
  anovaResults: Record<string, AnovaResult>;
  postHocResults: Record<string, PostHocResult>;
  correlationMatrix?: CorrelationMatrix;
  regressionResults?: RegressionResult[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  isActive: boolean;
  tokensUsed: number;
  tokensLimit: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
