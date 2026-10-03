<script lang="ts">
  import type { Breed } from '../lib/dogs';
  import Dog from './Dog.svelte';
  import Lovebird from './Lovebird.svelte';

  export type BoxState = 'closed' | 'opening' | 'open' | 'sealed' | 'stamped';

  interface Props {
    phase: BoxState;
    /** Written on the gold seal once a choice exists. */
    seal?: string;
    breed: Breed;
    /** Pachino perches on the lid (and flies off when it opens). */
    bird?: boolean;
    stampText?: string;
  }

  let { phase, seal, breed, bird = false, stampText = 'Sfruttato' }: Props = $props();

  const lidOn = $derived(phase !== 'opening' && phase !== 'open');
  const ribbonOn = $derived(phase === 'closed' || phase === 'sealed' || phase === 'stamped');

  // Scalloped seal edge: 28 bumps around a circle.
  const sealEdge = (() => {
    const n = 28;
    const pts: string[] = [];
    for (let i = 0; i <= n * 2; i++) {
      const a = (Math.PI * i) / n;
      const r = i % 2 === 0 ? 50 : 46;
      pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
    }
    return pts.join(' ');
  })();
</script>

<div class="stage" data-state={phase}>
  <div class="dog" class:alert={phase === 'opening'}>
    <Dog {breed} size="100%" look={{ x: -0.8, y: 0.6 }} tilt={phase === 'opening' ? -14 : -6} />
  </div>

  <svg class="doily" viewBox="0 0 200 44" aria-hidden="true">
    <ellipse cx="100" cy="22" rx="99" ry="21" class="lace" />
    <ellipse cx="100" cy="22" rx="84" ry="15.5" class="holes" />
    <ellipse cx="100" cy="22" rx="70" ry="11" class="lace-in" />
  </svg>

  <div class="box">
    <div class="body">
      <div class="shade"></div>
      <div class="band band-v" class:off={!ribbonOn}></div>
      <div class="band band-h" class:off={!ribbonOn}></div>
      {#if !lidOn}
        <div class="inside"></div>
        <div class="tissue" aria-hidden="true"><span></span><span></span><span></span></div>
      {/if}
    </div>

    <div class="lid" class:off={!lidOn}>
      <div class="shade"></div>
      <div class="band band-v" class:off={!ribbonOn}></div>
      <svg class="bow" class:off={!ribbonOn} viewBox="0 0 160 90" aria-hidden="true">
        <path class="tail" d="M74 56 L52 88 L62 86 L66 94 L80 60 Z" />
        <path class="tail" d="M86 56 L108 88 L98 86 L94 94 L80 60 Z" />
        <path class="loop" d="M78 50 C58 18 18 14 22 40 C25 60 58 60 78 52 Z" />
        <path class="loop" d="M82 50 C102 18 142 14 138 40 C135 60 102 60 82 52 Z" />
        <path class="loop-in" d="M74 48 C60 30 36 28 38 40 C40 50 58 52 74 50 Z" />
        <path class="loop-in" d="M86 48 C100 30 124 28 122 40 C120 50 102 52 86 50 Z" />
        <rect class="knot" x="70" y="40" width="20" height="18" rx="6" />
      </svg>
    </div>

    {#if bird}
      <div class="perch" class:flown={!lidOn}>
        <Lovebird size="100%" tilt={phase === 'stamped' ? -12 : 0} />
      </div>
    {/if}

    {#if seal && (phase === 'sealed' || phase === 'stamped')}
      <div class="seal">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <polygon points={sealEdge} />
          <circle cx="50" cy="50" r="38" />
        </svg>
        <span class="script">{seal}</span>
      </div>
    {/if}

    {#if phase === 'stamped'}
      <div class="stamp" aria-hidden="true">{stampText}</div>
    {/if}
  </div>
</div>


<style>
  .stage {
    --w: min(420px, 82vw, 54dvh);
    position: relative;
    width: var(--w);
    height: calc(var(--w) * 0.98);
    margin: 0 auto;
  }

  /* peeks over the lid from behind the box, eyes just above the edge */
  .dog {
    position: absolute;
    right: 5%;
    bottom: 61%;
    width: 37%;
    z-index: 0;
    transform: rotate(10deg);
    transition: transform 500ms var(--ease-settle);
  }

  .dog.alert {
    transform: rotate(2deg) translateY(-14px);
  }

  .box {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .body {
    position: absolute;
    left: 6%;
    right: 6%;
    top: 34%;
    bottom: 0;
    border-radius: 6px 6px 14px 14px;
    background: var(--stripes);
    box-shadow: var(--shadow-lift);
    overflow: hidden;
    transition: top 700ms var(--ease-out-expo);
  }

  .lid {
    position: absolute;
    left: 2%;
    right: 2%;
    top: 22%;
    height: 15%;
    border-radius: 10px;
    background: var(--stripes);
    background-position: calc(var(--stripe-w) * 0.5) 0;
    box-shadow: 0 10px 14px -8px rgb(62 31 34 / 0.4);
    transition:
      transform 720ms var(--ease-out-expo) 520ms,
      opacity 520ms ease 640ms;
  }

  .lid.off {
    transform: translate(46%, -120%) rotate(24deg);
    opacity: 0;
  }

  .shade {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      linear-gradient(180deg, rgb(255 255 255 / 0.28), transparent 30%),
      linear-gradient(90deg, transparent 70%, rgb(143 23 69 / 0.12));
    pointer-events: none;
  }

  /* Pachino stands on the left of the lid */
  .perch {
    position: absolute;
    left: 7%;
    bottom: 77%;
    width: 19%;
    z-index: 2;
    transition:
      transform 900ms var(--ease-out-expo),
      opacity 500ms ease 300ms;
  }

  .perch.flown {
    transform: translate(-80%, -220%) rotate(-24deg);
    opacity: 0;
  }

  .doily {
    position: absolute;
    left: -2%;
    right: -2%;
    bottom: -7%;
    width: 104%;
    z-index: 0;
    overflow: visible;
    filter: drop-shadow(0 4px 6px rgb(143 23 69 / 0.15));
  }

  .doily .lace {
    fill: var(--color-paper);
    stroke: var(--color-paper);
    stroke-width: 3;
    stroke-dasharray: 0.1 6.2;
    stroke-linecap: round;
  }

  .doily .holes {
    fill: none;
    stroke: var(--color-petal);
    stroke-width: 2.4;
    stroke-dasharray: 0.1 5;
    stroke-linecap: round;
  }

  .doily .lace-in {
    fill: none;
    stroke: var(--color-line);
    stroke-width: 0.8;
  }

  .tissue {
    position: absolute;
    inset: -1px 0 auto;
    height: 30%;
    pointer-events: none;
  }

  .tissue span {
    position: absolute;
    top: 0;
    width: 46%;
    height: 100%;
    background: #fff;
    opacity: 0.85;
    clip-path: polygon(0 0, 100% 0, 60% 100%, 40% 70%);
    animation: tissue 600ms var(--ease-out-expo) 500ms both;
  }

  .tissue span:nth-child(1) {
    left: 2%;
    transform: rotate(-8deg);
  }

  .tissue span:nth-child(2) {
    left: 30%;
    background: var(--color-petal);
  }

  .tissue span:nth-child(3) {
    right: 2%;
    transform: rotate(9deg) scaleX(-1);
  }

  @keyframes tissue {
    from {
      clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
    }
  }

  .inside {
    position: absolute;
    inset: 0 0 auto;
    height: 26%;
    background: linear-gradient(180deg, rgb(62 31 34 / 0.38), transparent);
  }

  .band {
    position: absolute;
    background:
      linear-gradient(90deg, transparent 38%, rgb(255 255 255 / 0.28) 50%, transparent 62%),
      var(--color-ribbon);
    transition: clip-path 360ms var(--ease-out-expo) 260ms;
  }

  .band-v {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 34px;
    margin-left: -17px;
    clip-path: inset(0 0 0 0);
  }

  .band-h {
    left: 0;
    right: 0;
    top: 40%;
    height: 30px;
    background:
      linear-gradient(180deg, transparent 38%, rgb(255 255 255 / 0.24) 50%, transparent 62%),
      var(--color-ribbon);
    clip-path: inset(0 0 0 0);
  }

  .band-v.off {
    clip-path: inset(100% 0 0 0);
  }

  .band-h.off {
    clip-path: inset(0 50% 0 50%);
  }

  .bow {
    position: absolute;
    left: 50%;
    bottom: 58%;
    width: 64%;
    transform: translateX(-50%);
    transform-origin: 50% 70%;
    overflow: visible;
    filter: drop-shadow(0 3px 3px rgb(62 31 34 / 0.25));
    transition:
      transform 420ms var(--ease-out-expo),
      opacity 300ms ease 120ms;
  }

  .bow.off {
    transform: translateX(-50%) scale(0.2) rotate(-30deg);
    opacity: 0;
  }

  .loop,
  .tail {
    fill: var(--color-ribbon);
  }

  .loop-in {
    fill: var(--color-ribbon-deep);
  }

  .knot {
    fill: #a51e51;
  }

  [data-state='open'] .body,
  [data-state='opening'] .body {
    top: 30%;
  }

  .seal {
    position: absolute;
    left: 50%;
    top: 67%;
    width: 42%;
    aspect-ratio: 1;
    transform: translate(-50%, -50%) rotate(-6deg);
    display: grid;
    place-items: center;
    filter: drop-shadow(0 4px 6px rgb(62 31 34 / 0.3));
    animation: seal-in 640ms var(--ease-settle) both;
  }

  .seal svg {
    position: absolute;
    inset: 0;
  }

  .seal polygon {
    fill: var(--color-gold);
  }

  .seal circle {
    fill: none;
    stroke: var(--color-gold-deep);
    stroke-width: 1.4;
    stroke-dasharray: 2 3;
  }

  .seal span {
    position: relative;
    max-width: 82%;
    color: var(--color-cocoa);
    font-size: clamp(20px, 7vw, 30px);
    line-height: 1;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .stamp {
    position: absolute;
    z-index: 3;
    left: 50%;
    top: 46%;
    padding: 6px 16px 4px;
    border: 4px double var(--color-ribbon-deep);
    border-radius: 10px;
    color: var(--color-ribbon-deep);
    font-size: clamp(24px, 8vw, 34px);
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    background: rgb(255 250 251 / 0.72);
    filter: url(#stamp-ink);
    transform: translate(-50%, -50%) rotate(-14deg);
    animation: stamp 560ms var(--ease-out-expo) both;
  }

  @keyframes seal-in {
    from {
      transform: translate(-50%, -50%) rotate(-40deg) scale(0.3);
      opacity: 0;
    }
  }

  @keyframes stamp {
    0% {
      transform: translate(-50%, -50%) rotate(-24deg) scale(2.2);
      opacity: 0;
    }
    60% {
      transform: translate(-50%, -50%) rotate(-12deg) scale(0.94);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) rotate(-14deg) scale(1);
    }
  }
</style>
