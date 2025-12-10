import { Config, PullRequest } from '@/types';

const STORAGE_KEYS = {
  CONFIG: 'payroll_config',
  PRS: 'payroll_prs',
  DARK_MODE: 'payroll_dark_mode',
} as const;

/**
 * Save configuration to localStorage
 */
export function saveConfig(config: Config): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

/**
 * Load configuration from localStorage
 */
export function loadConfig(): Config | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save pull requests to localStorage
 */
export function savePRs(prs: PullRequest[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(prs));
}

/**
 * Load pull requests from localStorage
 */
export function loadPRs(): PullRequest[] | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.PRS);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save dark mode preference
 */
export function saveDarkMode(isDark: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDark));
}

/**
 * Load dark mode preference
 */
export function loadDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
  if (!stored) return false;
  try {
    return JSON.parse(stored);
  } catch {
    return false;
  }
}

/**
 * Clear all storage
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
