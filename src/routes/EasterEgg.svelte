<script lang="ts">
  import { onMount } from 'svelte';
  import Dog from '../components/Dog.svelte';
  import Lovebird from '../components/Lovebird.svelte';
  import { celebrate } from '../lib/confetti';
  import { pick } from '../lib/dogs';

  interface Props {
    nickname?: string;
    onyes: () => void;
  }

  let { nickname, onyes }: Props = $props();

  const UNLOCK_MS = 60_000;
  const FLEE_RADIUS = 110;
  const QUIPS = [
    'Ops, è scappato.',
    'Il No è un po’ timido.',
    'Non si fa prendere.',
    'Momo e Lilla tifano per il Sì.',
    'Lilla ha sbuffato.',
    'Pachino ha fischiato: è un sì.',
    'Momo l’ha visto scappare di là.',
    'Ci stai mettendo impegno, eh?',
    'Il No è in ferie.',
  ];

  let progress = $state(0);
  let unlocked = $derived(progress >= 1);
  let said = $state(false);
  let escapes = $state(0);
  let quip = $state('');

  let noBtn: HTMLButtonElement | undefined = $state();
  let yesBtn: HTMLButtonElement | undefined = $state();
  let questionEl: HTMLHeadingElement | undefined = $state();
  /** Once the No starts running it leaves the layout and lives in viewport coordinates. */
  let noPos = $state<{ x: number; y: number } | null>(null);

  let pointer = $state({ x: -1, y: -1 });
  let norfolkEl: HTMLDivElement | undefined = $state();
  let pinscherEl: HTMLDivElement | undefined = $state();

  function lookFrom(el: HTMLElement | undefined) {
    if (!el || pointer.x < 0) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    return {
      x: clamp((pointer.x - (r.left + r.width / 2)) / 260),
      y: clamp((pointer.y - (r.top + r.height * 0.4)) / 260),
    };
  }

  let birdEl: HTMLDivElement | undefined = $state();
  /** Pachino turns to face the pointer. */
  const birdFlip = $derived.by(() => {
    if (!birdEl || pointer.x < 0) return false;
    const r = birdEl.getBoundingClientRect();
    return pointer.x < r.left + r.width / 2;
  });

  const norfolkLook = $derived(lookFrom(norfolkEl));
  const pinscherLook = $derived(lookFrom(pinscherEl));

  function size() {
    const r = noBtn!.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function clampToViewport(x: number, y: number) {
    const { w, h } = size();
    const m = 12;
    return {
      x: Math.min(Math.max(m, x), innerWidth - w - m),
      y: Math.min(Math.max(m, y), innerHeight - h - m),
    };
  }

  /** The No must never sit on the Sì (it would block it) nor on the question (she must read it). */
  function coversYes(x: number, y: number) {
    const { w, h } = size();
    const m = 14;
    return [yesBtn, questionEl].some((el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return x < r.right + m && x + w > r.left - m && y < r.bottom + m && y + h > r.top - m;
    });
  }

  function center() {
    const r = noBtn!.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, rect: r };
  }

  function escaped() {
    escapes += 1;
    if (escapes === 1) quip = QUIPS[0];
    else if (escapes % 3 === 0) quip = pick(QUIPS.filter((q) => q !== quip));
  }

  /** Jumps somewhere far from (px, py). Used when pushing is not enough (corners, taps, keyboard). */
  function teleport(px: number, py: number) {
    if (!noBtn) return;
    const { w, h } = size();
    let best = { x: 0, y: 0, d: -1 };
    for (let i = 0; i < 12; i++) {
      const x = 12 + Math.random() * Math.max(1, innerWidth - w - 24);
      const y = 12 + Math.random() * Math.max(1, innerHeight - h - 24);
      const d = Math.hypot(x + w / 2 - px, y + h / 2 - py);
      if (d > best.d && !coversYes(x, y)) best = { x, y, d };
    }
    noPos = { x: best.x, y: best.y };
    escaped();
  }

  function onPointerMove(e: PointerEvent) {
    pointer = { x: e.clientX, y: e.clientY };
    if (said || !noBtn || e.pointerType === 'touch') return;
    const c = center();
    const dx = c.x - e.clientX;
    const dy = c.y - e.clientY;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist > FLEE_RADIUS) return;
    // Pushed away along the line from the cursor, as if the cursor shoved it.
    const push = FLEE_RADIUS + 50 - dist;
    const next = clampToViewport(c.rect.left + (dx / dist) * push, c.rect.top + (dy / dist) * push);
    const after = Math.hypot(next.x + c.rect.width / 2 - e.clientX, next.y + c.rect.height / 2 - e.clientY);
    if (after < FLEE_RADIUS * 0.75 || coversYes(next.x, next.y)) {
      teleport(e.clientX, e.clientY);
    } else {
      const first = noPos === null;
      noPos = next;
      if (first) escaped();
    }
  }

  function dodge(e: Event) {
    // The No can be pressed in theory. In practice it is never there when you arrive.
    e.preventDefault();
    const p = e instanceof PointerEvent ? { x: e.clientX, y: e.clientY } : center();
    teleport(p.x, p.y);
  }

  function yes() {
    if (!unlocked || said) return;
    said = true;
    celebrate(true);
    setTimeout(onyes, 1900);
  }

  onMount(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      progress = Math.min(1, (t - start) / UNLOCK_MS);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<svelte:window onpointermove={onPointerMove} />

<div class="wrap">
  <div class="card" class:said>
    <h1 class="question script" bind:this={questionEl}>
      {#if said}
        Allora è deciso!
      {:else}
        {#if nickname}
          <span class="nick">{nickname},</span>
          vuoi venire a cena con me?
        {:else}
          Vuoi venire a cena con me?
        {/if}
      {/if}
    </h1>

    <div class="buttons" class:hidden={said}>
      <button
        bind:this={yesBtn}
        class="yes"
        class:ready={unlocked}
        style:--p={progress}
        aria-disabled={!unlocked}
        onclick={yes}
      >
        <span class="fill" aria-hidden="true"></span>
        <span class="yes-label">Sì</span>
      </button>

      <button
        bind:this={noBtn}
        class="no"
        class:running={noPos !== null}
        style:left={noPos ? `${noPos.x}px` : undefined}
        style:top={noPos ? `${noPos.y}px` : undefined}
        onpointerdown={dodge}
        onclick={dodge}
      >
        No
      </button>
      {#if noPos}
        <!-- keeps the Sì in place after the No leaves the row -->
        <span class="no-ghost" aria-hidden="true"></span>
      {/if}
    </div>

    <p class="quip" aria-live="polite">{said ? '' : quip}</p>

    <div class="bird" bind:this={birdEl} aria-hidden="true">
      <Lovebird size={58} flip={birdFlip} tilt={said ? -16 : escapes % 2 ? 12 : 0} />
    </div>

    <div class="dogs" aria-hidden="true">
      <div class="dog-l" bind:this={norfolkEl}>
        <Dog breed="norfolk" size={104} look={norfolkLook} happy={said || escapes > 0} tilt={escapes % 2 ? 10 : -4} />
      </div>
      <div class="dog-r" bind:this={pinscherEl}>
        <Dog breed="pinscher" size={104} look={pinscherLook} happy={said} tilt={escapes % 2 ? -8 : 6} />
      </div>
    </div>
  </div>
</div>

<style>
  .wrap {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 24px 16px;
    background:
      radial-gradient(ellipse at 50% 45%, rgb(255 250 251 / 0.55), transparent 60%),
      var(--stripes);
    overflow: hidden;
    touch-action: manipulation;
  }

  .card {
    position: relative;
    width: min(520px, 100%);
    box-sizing: border-box;
    padding: 48px 28px 120px;
    border-radius: 8px;
    background: var(--color-paper);
    box-shadow: var(--shadow-lift);
    text-align: center;
  }

  /* doily scallops along top and bottom edge */
  .card::before,
  .card::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 20px;
    background:
      radial-gradient(circle at 10px 10px, var(--color-stripe) 2.6px, transparent 3.2px) 0 0 / 20px 20px repeat-x,
      radial-gradient(circle at 10px 10px, var(--color-paper) 10px, transparent 10.5px) 0 0 / 20px 20px repeat-x;
  }

  .card::before {
    top: -10px;
  }

  .card::after {
    bottom: -10px;
    z-index: 1;
  }

  .question {
    margin: 0 auto;
    max-width: 12ch;
    font-size: clamp(44px, 12vw, 68px);
    line-height: 1.02;
    color: var(--color-cocoa);
    min-height: 2.1em;
  }

  .nick {
    display: block;
    color: var(--color-ribbon);
  }

  .said .question {
    color: var(--color-ribbon);
    animation: pop 600ms var(--ease-settle);
  }

  .buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
    transition: opacity 300ms;
  }

  .buttons.hidden {
    opacity: 0;
    pointer-events: none;
  }

  .yes,
  .no,
  .no-ghost {
    width: 132px;
    height: 56px;
    border-radius: 999px;
    font-weight: 750;
    font-size: 20px;
  }

  .yes {
    position: relative;
    overflow: hidden;
    border: 0;
    background: var(--color-petal);
    color: var(--color-cocoa-soft);
    cursor: not-allowed;
    isolation: isolate;
  }

  .fill {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--color-stripe);
    transform-origin: left;
    transform: scaleX(var(--p));
  }

  .yes.ready {
    background: var(--color-ribbon);
    color: #fff;
    cursor: pointer;
    box-shadow: var(--shadow-lift);
    animation: wiggle 900ms var(--ease-settle) 1;
  }

  .yes.ready .fill {
    opacity: 0;
  }

  .yes.ready:hover {
    background: var(--color-ribbon-deep);
  }

  .no {
    border: 0;
    background: var(--color-paper);
    color: var(--color-cocoa);
    box-shadow: inset 0 0 0 2px var(--color-line);
    cursor: pointer;
  }

  .no.running {
    position: fixed;
    z-index: 10;
    box-shadow:
      inset 0 0 0 2px var(--color-line),
      var(--shadow-soft);
    transition:
      left 200ms var(--ease-out-expo),
      top 200ms var(--ease-out-expo);
  }

  .no-ghost {
    display: block;
  }

  .quip {
    min-height: 1.5em;
    margin: 18px 0 0;
    color: var(--color-cocoa-soft);
    font-size: 15px;
  }

  /* Pachino perched on the lace along the top edge */
  .bird {
    position: absolute;
    top: -52px;
    right: 34px;
    z-index: 2;
  }

  .dogs {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 112px;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
  }

  .dog-l,
  .dog-r {
    position: absolute;
    bottom: -14px;
  }

  .dog-l {
    left: 18px;
  }

  .dog-r {
    right: 18px;
  }

  @keyframes wiggle {
    0%,
    100% {
      transform: rotate(0);
    }
    20% {
      transform: rotate(-6deg) scale(1.06);
    }
    45% {
      transform: rotate(5deg) scale(1.06);
    }
    70% {
      transform: rotate(-2deg);
    }
  }

  @keyframes pop {
    from {
      transform: scale(0.6);
      opacity: 0;
    }
  }
</style>
