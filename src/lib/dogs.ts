export type Breed = 'norfolk' | 'pinscher';

export const DOG_NAMES: Record<Breed, string> = {
  norfolk: 'Lilla',
  pinscher: 'Momo',
};

export function randomBreed(): Breed {
  return Math.random() < 0.5 ? 'norfolk' : 'pinscher';
}

/** One dog most of the time, both together every so often. */
export function randomCast(): Breed[] {
  const r = Math.random();
  if (r < 0.25) return ['norfolk', 'pinscher'];
  return [randomBreed()];
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Pachino, the blue Fischer's lovebird: not a dog, but part of the family. */
export const BIRD_NAME = 'Pachino';
