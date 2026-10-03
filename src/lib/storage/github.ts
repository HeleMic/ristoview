import type { GitHubConfig } from './config';

export type GitHubErrorKind =
  | 'auth'
  | 'notfound'
  | 'forbidden'
  | 'ratelimit'
  | 'conflict'
  | 'network'
  | 'unknown';

export class GitHubError extends Error {
  constructor(
    public kind: GitHubErrorKind,
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

const API = 'https://api.github.com';

function headers(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function request(url: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    // GitHub sends cache headers on contents; a stale copy would hide the other device's writes.
    res = await fetch(url, { ...init, cache: 'no-store' });
  } catch {
    throw new GitHubError('network', 'Nessuna connessione con GitHub.');
  }
  if (res.ok) return res;
  if (res.status === 401) throw new GitHubError('auth', 'Token non valido o scaduto.', 401);
  if (res.status === 404) {
    throw new GitHubError('notfound', 'Repository o file non trovato (o il token non ha accesso).', 404);
  }
  if (res.status === 409 || res.status === 422) {
    throw new GitHubError('conflict', 'Il file è cambiato nel frattempo.', res.status);
  }
  if (res.status === 429 || (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0')) {
    throw new GitHubError('ratelimit', 'Troppe richieste a GitHub: riprova tra qualche minuto.', res.status);
  }
  if (res.status === 403) {
    throw new GitHubError('forbidden', 'Permesso negato: il token deve avere Contents in lettura e scrittura.', 403);
  }
  throw new GitHubError('unknown', `GitHub ha risposto ${res.status}.`, res.status);
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function contentsUrl(c: GitHubConfig): string {
  const path = c.path.split('/').map(encodeURIComponent).join('/');
  return `${API}/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${path}`;
}

export interface RemoteFile {
  text: string;
  sha: string;
}

/** Reads the data file; resolves null when the repo exists but the file does not yet. */
export async function readFile(c: GitHubConfig): Promise<RemoteFile | null> {
  try {
    const res = await request(`${contentsUrl(c)}?ref=${encodeURIComponent(c.branch)}`, {
      headers: headers(c.token),
    });
    const body = (await res.json()) as { content?: string; encoding?: string; sha: string };
    if (body.encoding === 'base64' && body.content !== undefined) {
      return { text: decodeBase64(body.content), sha: body.sha };
    }
    // Files over 1 MB come without inline content: fetch the raw bytes separately.
    const raw = await request(`${contentsUrl(c)}?ref=${encodeURIComponent(c.branch)}`, {
      headers: { ...headers(c.token), Accept: 'application/vnd.github.raw+json' },
    });
    return { text: await raw.text(), sha: body.sha };
  } catch (e) {
    if (e instanceof GitHubError && e.kind === 'notfound') {
      // Distinguish "no file yet" from "no repo / no access".
      await checkRepo(c);
      return null;
    }
    throw e;
  }
}

/** Writes the data file. `sha` must be the revision we read, or null to create it. Returns the new sha. */
export async function writeFile(
  c: GitHubConfig,
  text: string,
  sha: string | null,
  message: string,
): Promise<string> {
  const res = await request(contentsUrl(c), {
    method: 'PUT',
    headers: { ...headers(c.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: encodeBase64(text),
      branch: c.branch,
      ...(sha ? { sha } : {}),
    }),
  });
  const body = (await res.json()) as { content: { sha: string } };
  return body.content.sha;
}

/** Confirms the token can see the repo and write to it. */
export async function checkRepo(c: GitHubConfig): Promise<void> {
  const res = await request(`${API}/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}`, {
    headers: headers(c.token),
  });
  const repo = (await res.json()) as { permissions?: { push?: boolean } };
  if (repo.permissions && repo.permissions.push === false) {
    throw new GitHubError('forbidden', 'Il token può solo leggere: serve Contents in lettura e scrittura.', 403);
  }
}
