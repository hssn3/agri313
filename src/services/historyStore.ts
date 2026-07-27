/**
 * historyStore.ts
 * ذخیره و بازیابی تاریخچه پروژه‌ها در localStorage
 */
import type { AnalysisResult, ExperimentalConfig, DesignType, DataRow } from '../types';

export interface ProjectRecord {
  id: string;
  title: string;           // نام پروژه (از researchTitle یا auto-generated)
  designType: DesignType;
  designTitle: string;
  createdAt: string;       // ISO date
  updatedAt: string;
  researcherName: string;
  config: ExperimentalConfig;
  data: DataRow[];
  result: AnalysisResult;
  version: string;         // نسخه app که با آن ساخته شد
}

const STORAGE_KEY = 'smartagri_projects';
const MAX_PROJECTS = 50;

function load(): ProjectRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(projects: ProjectRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    console.warn('localStorage full — oldest project removed');
    const trimmed = projects.slice(1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

export const HistoryStore = {
  getAll(): ProjectRecord[] {
    return load().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getById(id: string): ProjectRecord | null {
    return load().find(p => p.id === id) ?? null;
  },

  save(record: Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt' | 'version'>): ProjectRecord {
    const projects = load();
    const now = new Date().toISOString();
    const appVersion = (window as any).__APP_VERSION__ ?? '1.1.0';

    const newRecord: ProjectRecord = {
      ...record,
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      version: appVersion,
    };

    const updated = [newRecord, ...projects].slice(0, MAX_PROJECTS);
    save(updated);
    return newRecord;
  },

  update(id: string, patch: Partial<Omit<ProjectRecord, 'id' | 'createdAt'>>): boolean {
    const projects = load();
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    projects[idx] = { ...projects[idx], ...patch, updatedAt: new Date().toISOString() };
    save(projects);
    return true;
  },

  delete(id: string): boolean {
    const projects = load();
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === projects.length) return false;
    save(filtered);
    return true;
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  count(): number {
    return load().length;
  },
};
