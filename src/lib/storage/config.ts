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
  /** Passphrase that encrypts data.json. Same on every device; never sent anywhere. */
  key: string;
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
    const config = raw ? (JSON.parse(raw) as DeviceConfig) : null;
    // Devices set up before encryption existed have no key: they go through setup again.
    if (config?.mode === 'github' && !config.key) return null;
    return config;
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
