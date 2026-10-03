import { emptyData, type AppData } from './types';

interface Versioned {
  id: string;
  updatedAt: string;
}

function mergeById<T extends Versioned>(a: T[], b: T[], deleted: Set<string>): T[] {
  const byId = new Map<string, T>();
  for (const item of [...a, ...b]) {
    if (deleted.has(item.id)) continue;
    const current = byId.get(item.id);
    if (!current || item.updatedAt > current.updatedAt) byId.set(item.id, item);
  }
  return [...byId.values()];
}

/**
 * Two devices may each create a restaurant offline and both pick the same next
 * number. The older one keeps it; later duplicates move to the end of the sequence.
 */
function fixNumbering(data: AppData): void {
  const sorted = [...data.restaurants].sort(
    (x, y) => x.createdAt.localeCompare(y.createdAt) || x.id.localeCompare(y.id),
  );
  const used = new Set<number>();
  let max = Math.max(0, ...sorted.map((r) => r.number || 0));
  data.restaurants = sorted.map((r) => {
    // Places still on the wishlist get their number on the first visit.
    if (r.wishlist && !r.number) return r;
    if (r.number > 0 && !used.has(r.number)) {
      used.add(r.number);
      return r;
    }
    max += 1;
    used.add(max);
    return { ...r, number: max };
  });
}

/** Merges two copies of the data. Newest `updatedAt` wins per record; deletions always win. */
export function mergeData(local: AppData, remote: AppData): AppData {
  const deleted = new Set([...(local.deleted ?? []), ...(remote.deleted ?? [])]);
  const settings =
    local.settings.updatedAt >= remote.settings.updatedAt ? local.settings : remote.settings;
  const merged: AppData = {
    version: 1,
    updatedAt: local.updatedAt > remote.updatedAt ? local.updatedAt : remote.updatedAt,
    settings: {
      ...settings,
      // Once she said yes, she said yes.
      easterEggSeen: local.settings.easterEggSeen || remote.settings.easterEggSeen,
    },
    gifts: mergeById(local.gifts, remote.gifts, deleted),
    restaurants: mergeById(local.restaurants, remote.restaurants, deleted),
    reviews: mergeById(local.reviews, remote.reviews, deleted),
    deleted: [...deleted],
  };
  fixNumbering(merged);
  return merged;
}

/** Accepts anything parsed from JSON and returns well-formed data, or throws. */
export function normalizeData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') throw new Error('Il file dati non contiene un oggetto JSON.');
  const r = raw as Partial<AppData>;
  const base = emptyData(r.updatedAt);
  const list = <T>(v: unknown, name: string): T[] => {
    if (v === undefined) return [];
    if (!Array.isArray(v)) throw new Error(`Il campo "${name}" deve essere una lista.`);
    return v as T[];
  };
  return {
    version: 1,
    updatedAt: r.updatedAt ?? base.updatedAt,
    settings: { ...base.settings, ...(r.settings ?? {}) },
    gifts: list(r.gifts, 'gifts'),
    restaurants: list(r.restaurants, 'restaurants'),
    reviews: list(r.reviews, 'reviews'),
    deleted: list(r.deleted, 'deleted'),
  };
}
