/**
 * analysisService.ts — ارتباط با backend API
 */
import type { DataRow, ExperimentalConfig, DesignType, ComparisonMethod, AnalysisResult } from '../types';

const BASE = '/api';

export async function runAnalysis(params: {
  data: DataRow[];
  traits: string[];
  designType: DesignType;
  config: ExperimentalConfig;
  method: ComparisonMethod;
}): Promise<AnalysisResult> {
  const res = await fetch(`${BASE}/analysis/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'خطا در تحلیل');
  return json.data;
}

export async function parseCSV(csv: string, traits: string[]): Promise<{ rows: DataRow[]; headers: string[] }> {
  const res = await fetch(`${BASE}/analysis/parse-csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv, traits }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'خطا در پردازش CSV');
  return json.data;
}

export function getSampleUrl(designType: DesignType): string {
  return `${BASE}/export/sample/${designType}`;
}

export async function exportToExcel(analysisResult: AnalysisResult, config: ExperimentalConfig, designTitle: string): Promise<void> {
  const res = await fetch(`${BASE}/export/excel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysisResult, config, designTitle }),
  });
  if (!res.ok) throw new Error('خطا در خروجی Excel');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smartagri-results.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
