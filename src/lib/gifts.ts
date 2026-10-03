import type { AppData, Gift } from './types';

export interface GiftCategory {
  id: string;
  label: string;
  /** Short line under the label on the menu. */
  hint: string;
}

export const GIFT_CATEGORIES: GiftCategory[] = [
  { id: 'sushi', label: 'Sushi', hint: 'nigiri, uramaki, edamame' },
  { id: 'pizza', label: 'Pizza', hint: 'napoletana o alla pala' },
  { id: 'hamburger', label: 'Hamburger', hint: 'con patatine, ovvio' },
  { id: 'pesce', label: 'Pesce', hint: 'crudi, fritto misto, spaghetti alle vongole' },
  { id: 'carne', label: 'Carne', hint: 'fiorentina, tagliata, brace' },
  { id: 'trattoria', label: 'Trattoria', hint: 'cucina di casa, porzioni generose' },
  { id: 'ramen', label: 'Ramen', hint: 'brodo caldo e gyoza' },
  { id: 'cinese', label: 'Cinese', hint: 'ravioli al vapore, anatra laccata' },
  { id: 'messicano', label: 'Messicano', hint: 'tacos, nachos, margarita' },
  { id: 'indiano', label: 'Indiano', hint: 'curry, naan, tandoori' },
  { id: 'thai', label: 'Thai', hint: 'pad thai e curry al cocco' },
  { id: 'poke', label: 'Poke', hint: 'bowl fresca e leggera' },
  { id: 'tapas', label: 'Tapas', hint: 'tanti piattini da condividere' },
  { id: 'vegetariano', label: 'Vegetariano', hint: 'verdure protagoniste' },
  { id: 'sorpresa', label: 'Sorprendimi', hint: 'scegli tu, mi fido' },
];

export function categoryLabel(id: string | undefined): string {
  return GIFT_CATEGORIES.find((c) => c.id === id)?.label ?? id ?? '';
}

export function monthKey(date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${m}`;
}

export function giftId(month: string): string {
  return `g_${month}`;
}

export type GiftStatus = 'unopened' | 'chosen' | 'redeemed' | 'expired';

export function giftStatus(gift: Gift | undefined, now = new Date()): GiftStatus {
  if (!gift) return 'unopened';
  if (gift.redeemedAt) return 'redeemed';
  if (gift.month < monthKey(now)) return 'expired';
  return gift.category ? 'chosen' : 'unopened';
}

export function currentGift(data: AppData, now = new Date()): Gift | undefined {
  return data.gifts.find((g) => g.id === giftId(monthKey(now)));
}

/** Past gifts, newest first. Past months with no gift at all are not listed. */
export function giftHistory(data: AppData, now = new Date()): Gift[] {
  const current = monthKey(now);
  return data.gifts.filter((g) => g.month < current).sort((a, b) => b.month.localeCompare(a.month));
}

/** Last day of the month as a readable deadline, e.g. "31 ottobre". */
export function monthDeadline(now = new Date()): string {
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return last.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
}

export function daysLeftInMonth(now = new Date()): number {
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return last.getDate() - now.getDate();
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}
