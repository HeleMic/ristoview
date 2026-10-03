import { describe, expect, test } from 'bun:test';
import { mergeData, normalizeData } from './merge';
import { emptyData, type AppData, type Restaurant } from './types';

function restaurant(id: string, number: number, createdAt: string, updatedAt = createdAt): Restaurant {
  return { id, number, name: id, createdAt, updatedAt };
}

function data(patch: Partial<AppData>): AppData {
  return { ...emptyData('2026-10-01T00:00:00.000Z'), ...patch };
}

describe('mergeData', () => {
  test('keeps records from both sides and the newest version of each', () => {
    const local = data({
      restaurants: [
        restaurant('a', 1, '2026-10-01', '2026-10-05'),
        restaurant('b', 2, '2026-10-02'),
      ],
    });
    const remote = data({
      restaurants: [restaurant('a', 1, '2026-10-01', '2026-10-03'), restaurant('c', 3, '2026-10-03')],
    });
    remote.restaurants[0].name = 'vecchio';
    const merged = mergeData(local, remote);
    expect(merged.restaurants.map((r) => r.id).sort()).toEqual(['a', 'b', 'c']);
    expect(merged.restaurants.find((r) => r.id === 'a')?.name).toBe('a');
  });

  test('deletions on either side win', () => {
    const local = data({ restaurants: [restaurant('a', 1, '2026-10-01', '2026-10-09')] });
    const remote = data({ deleted: ['a'] });
    expect(mergeData(local, remote).restaurants).toEqual([]);
    expect(mergeData(local, remote).deleted).toContain('a');
  });

  test('renumbers a catalog number created on two devices at once', () => {
    const local = data({ restaurants: [restaurant('x', 4, '2026-10-02')] });
    const remote = data({ restaurants: [restaurant('y', 4, '2026-10-01')] });
    const merged = mergeData(local, remote);
    expect(merged.restaurants.find((r) => r.id === 'y')?.number).toBe(4);
    expect(merged.restaurants.find((r) => r.id === 'x')?.number).toBe(5);
  });

  test('wishlist places stay unnumbered until the first visit', () => {
    const wish = { ...restaurant('w', 0, '2026-10-03'), wishlist: true };
    const merged = mergeData(data({ restaurants: [restaurant('a', 1, '2026-10-01'), wish] }), data({}));
    expect(merged.restaurants.find((r) => r.id === 'w')?.number).toBe(0);
  });

  test('once the easter egg is seen it stays seen', () => {
    const local = data({ settings: { easterEggSeen: false, nickname: 'A', updatedAt: '2026-10-05' } });
    const remote = data({ settings: { easterEggSeen: true, updatedAt: '2026-10-01' } });
    const merged = mergeData(local, remote);
    expect(merged.settings.easterEggSeen).toBe(true);
    expect(merged.settings.nickname).toBe('A');
  });
});

describe('normalizeData', () => {
  test('fills missing collections', () => {
    const d = normalizeData({ settings: { nickname: 'B' } });
    expect(d.restaurants).toEqual([]);
    expect(d.settings.nickname).toBe('B');
    expect(d.settings.easterEggSeen).toBe(false);
  });

  test('rejects malformed files', () => {
    expect(() => normalizeData('ciao')).toThrow();
    expect(() => normalizeData({ reviews: {} })).toThrow();
  });
});
