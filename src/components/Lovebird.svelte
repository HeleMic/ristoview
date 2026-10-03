<script lang="ts">
  import { BIRD_NAME } from '../lib/dogs';

  interface Props {
    size?: number | string;
    /** Faces left instead of right. */
    flip?: boolean;
    /** Extra head tilt in degrees (curious bird). */
    tilt?: number;
  }

  let { size = 64, flip = false, tilt = 0 }: Props = $props();
  const bobDelay = `${(Math.random() * 3).toFixed(2)}s`;
</script>

<!-- Pachino: blue Fischer's lovebird, pale grey-white face, cobalt body, white eye ring -->
<svg
  class="bird"
  class:flip
  width={size}
  height={typeof size === 'number' ? size : undefined}
  viewBox="0 0 80 80"
  aria-hidden="true"
  style:--bob-delay={bobDelay}
>
  <title>{BIRD_NAME}</title>
  <path d="M31 60 L15 78 L23 79 L35 66 Z" fill="#1b3f8f" />
  <path d="M33 62 L22 77 L27 77 L36 66 Z" fill="#6f95dc" />
  <ellipse cx="40" cy="50" rx="16" ry="20" transform="rotate(-18 40 50)" fill="#2557b8" />
  <ellipse cx="45.5" cy="52" rx="10" ry="15" transform="rotate(-18 45.5 52)" fill="#4b7bd8" />
  <path d="M30 39 C40 37 46 50 42 66 C36 68 28 62 26 52 C25 45 27 41 30 39 Z" fill="#1c4596" />
  <path
    d="M31 49 Q36 51 38 57 M30 55 Q34 57 36 62"
    fill="none"
    stroke="#3466c8"
    stroke-width="1.6"
    stroke-linecap="round"
  />
  <path d="M41 69 l-2.5 5.5 M45 69 l1 5.5" stroke="#8b90a0" stroke-width="2.4" stroke-linecap="round" />
  <g class="head" style:--tilt="{tilt}deg">
    <!-- grey nape blending into the blue of the neck -->
    <path d="M37 30 C38 18 48 12 57 15 C52 22 50 32 52 40 C46 41 40 38 37 30 Z" fill="#aab3c6" />
    <circle cx="50" cy="26" r="12.5" fill="#d4d9e3" />
    <path d="M47 15 C55 13 62 18 63 25 C59 29 54 29 51 25 C49 21 47 18 47 15 Z" fill="#eef0f5" />
    <path d="M52 30 C56 33 61 33 63 30 C62 36 57 39 52 37 Z" fill="#e4e7ee" />
    <circle cx="54" cy="24" r="4.8" fill="#fff" />
    <circle cx="54.6" cy="24" r="2.4" fill="#0d0d12" />
    <circle cx="55.4" cy="23.1" r="0.85" fill="#fff" />
    <path d="M60.5 22.5 C66.5 21.5 69.5 27 66.5 33.5 C64.5 31.5 61.5 31.3 59.5 31.2 Z" fill="#f3d3cc" />
    <path d="M59.5 31.2 C62.5 30.5 64.5 31.5 66 33.4" fill="none" stroke="#c99b93" stroke-width="1" />
  </g>
</svg>

<style>
  .bird {
    display: block;
    overflow: visible;
  }

  .flip {
    transform: scaleX(-1);
  }

  .head {
    transform-box: view-box;
    transform-origin: 46px 36px;
    transform: rotate(var(--tilt));
    animation: bob 4.6s infinite;
    animation-delay: var(--bob-delay);
    transition: transform 300ms var(--ease-settle);
  }

  @keyframes bob {
    0%,
    80%,
    100% {
      transform: rotate(var(--tilt));
    }
    84% {
      transform: rotate(calc(var(--tilt) - 14deg)) translateY(1px);
    }
    88% {
      transform: rotate(calc(var(--tilt) + 6deg));
    }
    92% {
      transform: rotate(calc(var(--tilt) - 10deg)) translateY(1px);
    }
  }
</style>
