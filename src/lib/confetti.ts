import confetti from 'canvas-confetti';

const COLORS = ['#f4a7be', '#b8235a', '#c9a15a', '#ffffff', '#ee88a6'];

export function celebrate(big = false): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const base = { colors: COLORS, disableForReducedMotion: true, scalar: 1.1, ticks: 220 };
  if (!big) {
    void confetti({ ...base, particleCount: 70, spread: 70, origin: { y: 0.55 } });
    return;
  }
  void confetti({ ...base, particleCount: 120, angle: 60, spread: 70, origin: { x: 0, y: 0.75 } });
  void confetti({ ...base, particleCount: 120, angle: 120, spread: 70, origin: { x: 1, y: 0.75 } });
  setTimeout(() => void confetti({ ...base, particleCount: 160, spread: 120, origin: { y: 0.4 } }), 380);
}
