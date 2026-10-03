import { RATING_KEYS, type AppData, type RatingKey, type Restaurant, type Review } from './types';

export const RATING_LABELS: Record<RatingKey, string> = {
  food: 'Cibo',
  service: 'Servizio',
  welcome: 'Accoglienza',
  ambience: 'Atmosfera',
  value: 'Qualità/prezzo',
};

export function reviewScore(review: Review): number | null {
  const values = RATING_KEYS.map((k) => review.ratings?.[k]).filter((v): v is number => !!v);
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function reviewsOf(data: AppData, restaurantId: string): Review[] {
  return data.reviews
    .filter((v) => v.restaurantId === restaurantId)
    .sort((a, b) => (b.date ?? b.createdAt).localeCompare(a.date ?? a.createdAt));
}

export function restaurantScore(data: AppData, restaurantId: string): number | null {
  const scores = reviewsOf(data, restaurantId)
    .map(reviewScore)
    .filter((s): s is number => s !== null);
  if (!scores.length) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function lastVisit(data: AppData, restaurantId: string): string | undefined {
  const v = reviewsOf(data, restaurantId)[0];
  return v ? (v.date ?? v.createdAt.slice(0, 10)) : undefined;
}

export interface Summary {
  dinners: number;
  places: number;
  spent: number;
  favouriteCuisine?: string;
  best?: Restaurant;
}

export function summary(data: AppData): Summary {
  const visited = data.restaurants.filter((r) => !r.wishlist);
  const cuisines = new Map<string, number>();
  for (const v of data.reviews) {
    const c = data.restaurants.find((r) => r.id === v.restaurantId)?.cuisine?.trim();
    if (c) cuisines.set(c, (cuisines.get(c) ?? 0) + 1);
  }
  let best: Restaurant | undefined;
  let bestScore = -1;
  for (const r of visited) {
    const s = restaurantScore(data, r.id);
    if (s !== null && s > bestScore) {
      best = r;
      bestScore = s;
    }
  }
  return {
    dinners: data.reviews.length,
    places: visited.length,
    spent: data.reviews.reduce((sum, v) => sum + (v.bill ?? 0), 0),
    favouriteCuisine: [...cuisines.entries()].sort((a, b) => b[1] - a[1])[0]?.[0],
    best,
  };
}

export function formatEuro(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: value % 1 ? 2 : 0 });
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function catalogNumber(n: number): string {
  return `N°${String(n).padStart(3, '0')}`;
}

export function todayIso(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}
