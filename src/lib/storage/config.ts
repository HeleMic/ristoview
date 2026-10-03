import type { Role } from '../types';

export interface GitHubConfig {
  mode: 'github';
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token: string;
  role: Role;
}

/** Data kept only in this browser: handy to try the app without GitHub. */
export interface LocalConfig {
  mode: 'local';
  role: Role;
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
