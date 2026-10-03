import { giftId, monthKey } from './gifts';
import { store } from './store.svelte';
import type { Restaurant, Review } from './types';

const now = () => new Date().toISOString();

export function newId(prefix: string): string {
  const rand = crypto.getRandomValues(new Uint32Array(2));
  return `${prefix}_${Date.now().toString(36)}${rand[0].toString(36)}${rand[1].toString(36)}`.slice(0, 22);
}

function nextNumber(): number {
  return Math.max(0, ...store.data.restaurants.map((r) => r.number || 0)) + 1;
}

export type RestaurantInput = Omit<Restaurant, 'id' | 'number' | 'createdAt' | 'updatedAt'>;
export type ReviewInput = Omit<Review, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'>;

export function findRestaurantByName(name: string): Restaurant | undefined {
  const key = name.trim().toLocaleLowerCase('it');
  return store.data.restaurants.find((r) => r.name.trim().toLocaleLowerCase('it') === key);
}

export function addRestaurant(input: RestaurantInput): Restaurant {
  const t = now();
  const restaurant: Restaurant = {
    ...input,
    name: input.name.trim(),
    id: newId('r'),
    number: input.wishlist ? 0 : nextNumber(),
    createdAt: t,
    updatedAt: t,
  };
  store.mutate(`nuovo ristorante «${restaurant.name}»`, (d) => {
    d.restaurants.push(restaurant);
  });
  return restaurant;
}

export function updateRestaurant(id: string, patch: Partial<RestaurantInput>): void {
  store.mutate('ristorante modificato', (d) => {
    const r = d.restaurants.find((x) => x.id === id);
    if (r) Object.assign(r, patch, { updatedAt: now() });
    if (r && !r.wishlist && !r.number) r.number = nextNumber();
  });
}

export function deleteRestaurant(id: string): void {
  store.mutate('ristorante eliminato', (d) => {
    const reviewIds = d.reviews.filter((v) => v.restaurantId === id).map((v) => v.id);
    d.restaurants = d.restaurants.filter((r) => r.id !== id);
    d.reviews = d.reviews.filter((v) => v.restaurantId !== id);
    d.deleted.push(id, ...reviewIds);
  });
}

export function saveReview(restaurantId: string, input: ReviewInput, reviewId?: string): string {
  const t = now();
  const name = store.data.restaurants.find((r) => r.id === restaurantId)?.name ?? '';
  if (reviewId) {
    store.mutate(`recensione modificata «${name}»`, (d) => {
      const v = d.reviews.find((x) => x.id === reviewId);
      if (v) Object.assign(v, input, { updatedAt: t });
    });
    return reviewId;
  }
  const id = newId('v');
  store.mutate(`nuova recensione «${name}»`, (d) => {
    d.reviews.push({ ...input, id, restaurantId, createdAt: t, updatedAt: t });
    // A review means we went there: it leaves the wishlist.
    const r = d.restaurants.find((x) => x.id === restaurantId);
    if (r?.wishlist) Object.assign(r, { wishlist: false, number: r.number || nextNumber(), updatedAt: t });
  });
  return id;
}

export function deleteReview(id: string): void {
  store.mutate('recensione eliminata', (d) => {
    d.reviews = d.reviews.filter((v) => v.id !== id);
    d.deleted.push(id);
  });
}

export function chooseGift(category: string): void {
  const month = monthKey();
  const id = giftId(month);
  store.mutate(`regalo di ${month}: ${category}`, (d) => {
    const t = now();
    const gift = d.gifts.find((g) => g.id === id);
    if (gift?.redeemedAt) return;
    if (gift) Object.assign(gift, { category, chosenAt: t, updatedAt: t });
    else d.gifts.push({ id, month, category, chosenAt: t, updatedAt: t });
  });
}

export function redeemGift(restaurantId?: string): void {
  const id = giftId(monthKey());
  store.mutate('regalo sfruttato', (d) => {
    const gift = d.gifts.find((g) => g.id === id);
    if (gift?.category) Object.assign(gift, { redeemedAt: now(), restaurantId, updatedAt: now() });
  });
}

/** After a redeemed gift, the first review written that month tells where we went. */
export function linkGiftToRestaurant(restaurantId: string): void {
  const gift = store.data.gifts.find((g) => g.id === giftId(monthKey()));
  if (!gift?.redeemedAt || gift.restaurantId) return;
  store.mutate('regalo collegato al ristorante', (d) => {
    const g = d.gifts.find((x) => x.id === gift.id);
    if (g) Object.assign(g, { restaurantId, updatedAt: now() });
  });
}

export function unredeemGift(): void {
  const id = giftId(monthKey());
  store.mutate('regalo di nuovo disponibile', (d) => {
    const gift = d.gifts.find((g) => g.id === id);
    if (gift) {
      delete gift.redeemedAt;
      delete gift.restaurantId;
      gift.updatedAt = now();
    }
  });
}

export function setNickname(nickname: string): void {
  store.mutate('soprannome', (d) => {
    d.settings.nickname = nickname.trim() || undefined;
    d.settings.updatedAt = now();
  });
}

export function markEasterEggSeen(): void {
  store.mutate('ha detto sì', (d) => {
    d.settings.easterEggSeen = true;
    d.settings.updatedAt = now();
  });
}
