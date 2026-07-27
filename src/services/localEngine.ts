/**
 * localEngine.ts — اجرای محاسبات مستقیماً در مرورگر (fallback)
 * وقتی backend در دسترس نیست، محاسبات client-side انجام می‌شود
 */
import { StatsEngine } from '../engine/statsEngine';
import type { DataRow, ExperimentalConfig, DesignType, ComparisonMethod, AnalysisResult } from '../types';

export function runLocalAnalysis(params: {
  data: DataRow[];
  traits: string[];
  designType: DesignType;
  config: ExperimentalConfig;
  method: ComparisonMethod;
}): AnalysisResult {
  const { data, traits, designType, config, method } = params;

  const traitStats = StatsEngine.calculateStats(data, traits);

  let anovaResults: AnalysisResult['anovaResults'] = {};
  if (designType === 'CRD') anovaResults = StatsEngine.crdAnova(data, traits);
  else if (designType === 'RCBD') anovaResults = StatsEngine.rcbdAnova(data, traits, config);
  else if (designType === 'LSD') anovaResults = StatsEngine.lsdAnova(data, traits, config);
  else if (designType === 'FACTORIAL') anovaResults = StatsEngine.factorialAnova(data, traits, config);
  else if (designType === 'SPLIT_PLOT') anovaResults = StatsEngine.splitPlotAnova(data, traits, config);

  const postHocResults: AnalysisResult['postHocResults'] = {};
  traits.forEach(trait => {
    if (anovaResults[trait]) {
      postHocResults[trait] = StatsEngine.postHoc(data, trait, anovaResults[trait], method, config);
    }
  });

  let correlationMatrix: AnalysisResult['correlationMatrix'];
  let regressionResults: AnalysisResult['regressionResults'];
  if (traits.length > 1) {
    correlationMatrix = StatsEngine.correlationMatrix(data, traits);
    regressionResults = [];
    for (let i = 0; i < traits.length; i++) {
      for (let j = i + 1; j < traits.length; j++) {
        regressionResults.push(StatsEngine.regression(data, traits[i], traits[j]));
      }
    }
  }

  return { traitStats, anovaResults, postHocResults, correlationMatrix, regressionResults };
}
