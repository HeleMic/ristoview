/**
 * End-to-end encryption of data.json. The passphrase never leaves the device: GitHub only ever
 * stores an envelope with the KDF parameters, a random IV and the AES-GCM ciphertext.
 */

export interface Envelope {
  ristoview: 'encrypted';
  v: 1;
  kdf: { name: 'PBKDF2'; hash: 'SHA-256'; iterations: number; salt: string };
  cipher: 'AES-GCM';
  iv: string;
  data: string;
}

export class WrongKeyError extends Error {
  constructor() {
    super('Chiave sbagliata: non riesco a decifrare i dati. Deve essere uguale su tutti e due i telefoni.');
  }
}

/** OWASP's 2023 recommendation for PBKDF2-HMAC-SHA256. Derived once per session, then cached. */
export const ITERATIONS = 600_000;

const toB64 = (bytes: Uint8Array): string => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};

const fromB64 = (b64: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

const keyCache = new Map<string, Promise<CryptoKey>>();

function deriveKey(passphrase: string, salt: string, iterations: number): Promise<CryptoKey> {
  const id = `${salt}:${iterations}:${passphrase}`;
  let key = keyCache.get(id);
  if (!key) {
    key = (async () => {
      const material = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(passphrase.normalize('NFC')),
        'PBKDF2',
        false,
        ['deriveKey'],
      );
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(salt), iterations },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
      );
    })();
    keyCache.set(id, key);
  }
  return key;
}

export function isEnvelope(value: unknown): value is Envelope {
  return !!value && typeof value === 'object' && (value as Envelope).ristoview === 'encrypted';
}

/** Encrypts `plain`. Reuses `salt` (the file's) when given, so every device derives the same key. */
export async function encrypt(plain: string, passphrase: string, salt?: string): Promise<{ text: string; salt: string }> {
  const useSalt = salt ?? toB64(crypto.getRandomValues(new Uint8Array(16)));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, useSalt, ITERATIONS);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain));
  const envelope: Envelope = {
    ristoview: 'encrypted',
    v: 1,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: useSalt },
    cipher: 'AES-GCM',
    iv: toB64(iv),
    data: toB64(new Uint8Array(cipher)),
  };
  return { text: `${JSON.stringify(envelope, null, 2)}\n`, salt: useSalt };
}

/**
 * Turns the file's text into plain JSON text. A file written before encryption existed is passed
 * through unchanged (the next save encrypts it). Throws WrongKeyError on a wrong passphrase.
 */
export async function decode(text: string, passphrase: string): Promise<{ plain: string; salt?: string }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { plain: text };
  }
  if (!isEnvelope(parsed)) return { plain: text };
  const key = await deriveKey(passphrase, parsed.kdf.salt, parsed.kdf.iterations);
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(parsed.iv) }, key, fromB64(parsed.data));
    return { plain: new TextDecoder().decode(plain), salt: parsed.kdf.salt };
  } catch {
    throw new WrongKeyError();
  }
}
