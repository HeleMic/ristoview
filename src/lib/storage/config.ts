import type { Role } from '../types';

/** Where the shared data lives. Both tokens are generated from this account. */
export const DATA_REPO = {
  owner: 'HeleMic',
  repo: 'ristoview-data',
  branch: 'main',
  path: 'data.json',
} as const;

export interface GitHubConfig {
  mode: 'github';
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token: string;
  role: Role;
  /** Who uses this device: signs the reviews. */
  name?: string;
}

/** Data kept only in this browser: handy to try the app without GitHub (dev only). */
export interface LocalConfig {
  mode: 'local';
  role: Role;
  name?: string;
}

export type DeviceConfig = GitHubConfig | LocalConfig;

const KEY = 'ristoview.config';

export function loadConfig(): DeviceConfig | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DeviceConfig) : null;
  } catch {
    return null;
  }
}

export function saveConfig(config: DeviceConfig): void {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function clearConfig(): void {
  localStorage.removeItem(KEY);
}
