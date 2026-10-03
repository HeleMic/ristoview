export type Role = 'lui' | 'lei';

export interface Settings {
  nickname?: string;
  easterEggSeen: boolean;
  updatedAt: string;
}

export interface Gift {
  /** Always `g_<month>`: one gift per calendar month, stable across devices. */
  id: string;
  /** "YYYY-MM" */
  month: string;
  category?: string;
  chosenAt?: string;
  redeemedAt?: string;
  restaurantId?: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  /** Catalog number in the collection, assigned in sequence (N°001, N°002…). */
  number: number;
  name: string;
  cuisine?: string;
  address?: string;
  mapsUrl?: string;
  wishlist?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const RATING_KEYS = ['food', 'service', 'welcome', 'ambience', 'value'] as const;
export type RatingKey = (typeof RATING_KEYS)[number];
export type Ratings = Partial<Record<RatingKey, number>>;

export interface Review {
  id: string;
  restaurantId: string;
  /** "YYYY-MM-DD" */
  date?: string;
  author?: Role;
  dishes?: string;
  ratings?: Ratings;
  waiters?: string;
  welcomeNotes?: string;
  bill?: number;
  people?: number;
  notes?: string;
  wouldReturn?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  version: 1;
  updatedAt: string;
  settings: Settings;
  gifts: Gift[];
  restaurants: Restaurant[];
  reviews: Review[];
  /** Tombstones: ids deleted on any device, so a merge never resurrects them. */
  deleted: string[];
}

export function emptyData(now = new Date().toISOString()): AppData {
  return {
    version: 1,
    updatedAt: now,
    settings: { easterEggSeen: false, updatedAt: '1970-01-01T00:00:00.000Z' },
    gifts: [],
    restaurants: [],
    reviews: [],
    deleted: [],
  };
}
