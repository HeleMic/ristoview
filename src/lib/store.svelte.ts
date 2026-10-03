import { decode, encrypt } from './crypto';
import { mergeData, normalizeData } from './merge';
import { clearCache, readCache, writeCache } from './storage/cache';
import { clearConfig, loadConfig, saveConfig, type DeviceConfig, type GitHubConfig } from './storage/config';
import { checkRepo, GitHubError, readFile, writeFile } from './storage/github';
import { emptyData, type AppData } from './types';

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'offline' | 'local' | 'error';

const PUSH_DELAY_MS = 800;
const PULL_THROTTLE_MS = 30_000;

/** Commit messages are public to anyone who can read the repo history: they never carry content. */
function commitMessage(messages: string[]): string {
  const n = messages.length;
  return n > 1 ? `ristoview: aggiornamento (${n} modifiche)` : 'ristoview: aggiornamento';
}

/** Decrypts (when needed) and validates the file read from GitHub. */
async function parseRemote(text: string, c: GitHubConfig): Promise<{ data: AppData; salt?: string }> {
  const { plain, salt } = await decode(text, c.key);
  try {
    return { data: normalizeData(JSON.parse(plain)), salt };
  } catch (e) {
    throw new Error(`Il file ${c.path} su GitHub non è valido: ${(e as Error).message} Lavoro sulla copia locale.`);
  }
}

class AppStore {
  config = $state<DeviceConfig | null>(loadConfig());
  data = $state<AppData>(emptyData());
  /** Cache loaded: the UI can render. */
  ready = $state(false);
  /** First contact with GitHub done (or skipped): the shared flags are trustworthy. */
  settled = $state(false);
  status = $state<SyncStatus>('idle');
  error = $state<string | null>(null);

  private sha: string | null = null;
  /** Salt of the encrypted file on GitHub, reused on save. A new one is harmless: it travels in the file. */
  private salt: string | undefined;
  private dirty = false;
  private pending: string[] = [];
  /** Bumped on every local edit, to tell whether edits landed while a request was in flight. */
  private revision = 0;
  private pushTimer: ReturnType<typeof setTimeout> | undefined;
  private flushing = false;
  private flushAgain = false;
  private lastPull = 0;

  get github(): GitHubConfig | null {
    return this.config?.mode === 'github' ? this.config : null;
  }

  async init(): Promise<void> {
    const cached = await readCache();
    if (cached) {
      this.data = normalizeData(cached.data);
      this.sha = cached.sha;
      this.dirty = cached.dirty;
      this.pending = cached.pendingMessages ?? [];
    }
    this.ready = true;
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => void this.pull());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && Date.now() - this.lastPull > PULL_THROTTLE_MS) {
          void this.pull();
        }
      });
    }
    await this.pull();
    this.settled = true;
  }

  /** Tests the configuration against GitHub, then adopts it and loads the remote data. */
  async connect(config: DeviceConfig): Promise<void> {
    if (config.mode === 'github') {
      await checkRepo(config);
      // A wrong key must stop setup here, before this device writes anything.
      const remote = await readFile(config);
      if (remote) this.salt = (await parseRemote(remote.text, config)).salt;
    }
    saveConfig(config);
    this.config = config;
    // Local-only data (if any) gets merged into the repo on first contact.
    this.sha = null;
    if (this.data.restaurants.length || this.data.reviews.length || this.data.gifts.length) {
      this.dirty = true;
    }
    this.error = null;
    await this.pull();
    this.settled = true;
  }

  /**
   * Wipes every restaurant, review, gift and setting on every device (see `resetAt` in merge),
   * then forgets this device too: token, role, name and local cache.
   * Throws, keeping the device connected, if the wipe could not reach GitHub.
   */
  async resetAll(): Promise<void> {
    const t = new Date().toISOString();
    this.mutate('reset completo dei dati', (d) => {
      Object.assign(d, emptyData(t), { resetAt: t });
    });
    if (this.github) {
      await this.flush();
      if (this.dirty) {
        throw new Error(
          'GitHub non risponde: i dati sono cancellati qui ma non ancora online. Riprova quando sei connesso.',
        );
      }
    }
    await this.disconnect();
  }

  async disconnect(): Promise<void> {
    clearConfig();
    await clearCache();
    this.config = null;
    this.data = emptyData();
    this.sha = null;
    this.salt = undefined;
    this.dirty = false;
    this.pending = [];
    this.status = 'idle';
    this.error = null;
  }

  /** Applies an edit locally, caches it, and schedules the upload. */
  mutate(message: string, edit: (data: AppData) => void): void {
    edit(this.data);
    this.data.updatedAt = new Date().toISOString();
    this.revision += 1;
    this.dirty = true;
    this.pending.push(message);
    void this.persist();
    if (!this.github) {
      this.status = 'local';
      return;
    }
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => void this.flush(), PUSH_DELAY_MS);
  }

  /** Merges an imported backup into the current data. */
  importData(raw: unknown): void {
    const incoming = normalizeData(raw);
    this.mutate('import da backup', (d) => {
      const merged = mergeData($state.snapshot(d) as AppData, incoming);
      Object.assign(d, merged);
    });
  }

  exportJson(): string {
    return JSON.stringify($state.snapshot(this.data), null, 2);
  }

  async pull(): Promise<void> {
    const c = this.github;
    if (!c) {
      this.status = this.config ? 'local' : 'idle';
      return;
    }
    this.lastPull = Date.now();
    this.status = 'syncing';
    try {
      const remote = await readFile(c);
      if (!remote) {
        // Empty repo: our copy becomes the first version of data.json.
        this.sha = null;
        this.dirty = true;
        await this.flush();
        return;
      }
      const { data: parsed, salt } = await parseRemote(remote.text, c);
      this.salt = salt;
      if (this.dirty) {
        this.data = mergeData($state.snapshot(this.data) as AppData, parsed);
        this.sha = remote.sha;
        await this.persist();
        await this.flush();
      } else {
        this.data = parsed;
        this.sha = remote.sha;
        await this.persist();
        this.ok();
      }
    } catch (e) {
      this.handle(e);
    }
  }

  /** Uploads pending edits, one request at a time. */
  async flush(): Promise<void> {
    clearTimeout(this.pushTimer);
    if (this.flushing) {
      this.flushAgain = true;
      return;
    }
    this.flushing = true;
    try {
      do {
        this.flushAgain = false;
        await this.pushOnce();
      } while (this.flushAgain && this.dirty);
    } finally {
      this.flushing = false;
    }
  }

  private async pushOnce(): Promise<void> {
    const c = this.github;
    if (!c || !this.dirty) return;
    this.status = 'syncing';
    for (let attempt = 0; attempt < 3; attempt++) {
      const revision = this.revision;
      const sent = this.pending.length;
      try {
        const sealed = await encrypt(JSON.stringify($state.snapshot(this.data)), c.key, this.salt);
        this.salt = sealed.salt;
        this.sha = await writeFile(c, sealed.text, this.sha, commitMessage(this.pending));
        this.pending = this.pending.slice(sent);
        if (this.revision === revision) this.dirty = false;
        await this.persist();
        this.ok();
        return;
      } catch (e) {
        if (e instanceof GitHubError && e.kind === 'conflict') {
          // The other device saved first: take its version, merge ours on top, try again.
          const remote = await readFile(c).catch((err) => this.handle(err));
          if (remote === undefined) return;
          if (remote) {
            let parsed: AppData;
            try {
              const result = await parseRemote(remote.text, c);
              parsed = result.data;
              this.salt = result.salt;
            } catch (err) {
              this.handle(err);
              return;
            }
            this.data = mergeData($state.snapshot(this.data) as AppData, parsed);
            this.sha = remote.sha;
          } else {
            this.sha = null;
          }
          continue;
        }
        this.handle(e);
        return;
      }
    }
    this.fail('Non riesco a salvare: il file continua a cambiare. Riprova tra poco.');
  }

  private async persist(): Promise<void> {
    await writeCache({
      data: $state.snapshot(this.data) as AppData,
      sha: this.sha,
      dirty: this.dirty,
      pendingMessages: this.pending,
    });
  }

  private ok(): void {
    this.status = this.dirty ? 'syncing' : 'saved';
    this.error = null;
  }

  private fail(message: string): void {
    this.status = 'error';
    this.error = message;
  }

  private handle(e: unknown): undefined {
    if (e instanceof GitHubError && e.kind === 'network') {
      this.status = 'offline';
      this.error = null;
    } else {
      this.fail(e instanceof Error ? e.message : String(e));
    }
    return undefined;
  }
}

export const store = new AppStore();
