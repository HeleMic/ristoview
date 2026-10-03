import { describe, expect, test } from 'bun:test';
import { currentGift, giftHistory, giftStatus, monthKey } from './gifts';
import { emptyData, type Gift } from './types';

const oct = new Date(2026, 9, 15);

function gift(month: string, patch: Partial<Gift> = {}): Gift {
  return { id: `g_${month}`, month, updatedAt: '2026-10-01', ...patch };
}

describe('gifts', () => {
  test('monthKey pads the month', () => {
    expect(monthKey(new Date(2026, 0, 31))).toBe('2026-01');
    expect(monthKey(oct)).toBe('2026-10');
  });

  test('status follows the life of a gift', () => {
    expect(giftStatus(undefined, oct)).toBe('unopened');
    expect(giftStatus(gift('2026-10'), oct)).toBe('unopened');
    expect(giftStatus(gift('2026-10', { category: 'sushi' }), oct)).toBe('chosen');
    expect(giftStatus(gift('2026-10', { category: 'sushi', redeemedAt: '2026-10-12' }), oct)).toBe('redeemed');
  });

  test('a gift not redeemed by the end of its month expires', () => {
    expect(giftStatus(gift('2026-09', { category: 'pizza' }), oct)).toBe('expired');
    expect(giftStatus(gift('2026-09', { category: 'pizza', redeemedAt: '2026-09-30' }), oct)).toBe('redeemed');
  });

  test('current gift and history split on the month', () => {
    const data = emptyData();
    data.gifts = [gift('2026-08'), gift('2026-10', { category: 'carne' }), gift('2026-09')];
    expect(currentGift(data, oct)?.category).toBe('carne');
    expect(giftHistory(data, oct).map((g) => g.month)).toEqual(['2026-09', '2026-08']);
  });
});
