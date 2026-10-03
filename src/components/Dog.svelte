<script lang="ts">
  import { DOG_NAMES, type Breed } from '../lib/dogs';

  interface Props {
    breed: Breed;
    size?: number | string;
    /** Where the dog looks, each axis in -1..1. */
    look?: { x: number; y: number };
    happy?: boolean;
    /** Slight head tilt, degrees. */
    tilt?: number;
    label?: string;
  }

  let { breed, size = 120, look = { x: 0, y: 0 }, happy = true, tilt = 0, label }: Props = $props();

  const gaze = $derived(`translate(${(look.x * 1.8).toFixed(2)} ${(look.y * 1.4).toFixed(2)})`);
  // Each dog blinks on its own rhythm so two dogs side by side never blink in sync.
  const blinkDelay = `${(Math.random() * 4).toFixed(2)}s`;
</script>

<svg
  class="dog"
  width={size}
  height={typeof size === "number" ? size : undefined}
  viewBox="0 0 120 120"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
  style:--blink-delay={blinkDelay}
>
  <title>{label ?? DOG_NAMES[breed]}</title>
  {#if breed === 'norfolk'}
    <!-- Norfolk terrier: wiry red-wheaten coat, small drop ears folded forward -->
    <path
      d="M20 112 L23 109.7 L20.9 107 L24.6 105.1 L23.5 102.2 L27.8 100.8 L27.6 97.9 L32.4 97.1 L33.2 94.2 L38.1 93.9 L40 91.2 L44.9 91.6 L47.6 89.2 L52.3 90.2 L55.8 88.1 L60 89.7 L64.2 88.1 L67.7 90.2 L72.4 89.2 L75.1 91.6 L80 91.2 L81.9 93.9 L86.8 94.2 L87.6 97.1 L92.4 97.9 L92.2 100.8 L96.5 102.2 L95.4 105.1 L99.1 107 L97 109.7 L100 112 L100 120 L20 120 Z"
      fill="#b9763c"
    />
    <path d="M38 99 Q60 109 82 99 L84 106 Q60 117 36 106 Z" fill="#b8235a" />
    <circle cx="60" cy="113" r="4.6" fill="#c9a15a" stroke="#8a6424" stroke-width="1" />
    <g class="head" style:transform="rotate({tilt}deg)">
      <path
        d="M95 56 L91.6 59.7 L93.8 64 L89.4 66.8 L90.3 71.5 L85.3 73.2 L84.7 77.9 L79.4 78.4 L77.5 82.8 L72.2 82.1 L69.1 85.9 L64.2 84 L60 87 L55.8 84 L50.9 85.9 L47.8 82.1 L42.5 82.8 L40.6 78.4 L35.3 77.9 L34.7 73.2 L29.7 71.5 L30.6 66.8 L26.2 64 L28.4 59.7 L25 56 L28.4 52.3 L26.2 48 L30.6 45.2 L29.7 40.5 L34.7 38.8 L35.3 34.1 L40.6 33.6 L42.5 29.2 L47.8 29.9 L50.9 26.1 L55.8 28 L60 25 L64.2 28 L69.1 26.1 L72.2 29.9 L77.5 29.2 L79.4 33.6 L84.7 34.1 L85.3 38.8 L90.3 40.5 L89.4 45.2 L93.8 48 L91.6 52.3 Z"
        fill="#c98a4b"
      />
      <!-- darker saddle on the crown -->
      <path d="M44 31 Q60 24 76 31 Q70 38 60 37 Q50 38 44 31 Z" fill="#b5743a" />
      <g class="ear ear-l">
        <path
          d="M28 36 L46 27 L41 52 Z"
          fill="#9e5f2a"
          stroke="#9e5f2a"
          stroke-width="5"
          stroke-linejoin="round"
        />
      </g>
      <g class="ear ear-r">
        <path
          d="M92 36 L74 27 L79 52 Z"
          fill="#9e5f2a"
          stroke="#9e5f2a"
          stroke-width="5"
          stroke-linejoin="round"
        />
      </g>
      <!-- bushy brows -->
      <path
        d="M38 47 l3 -5 3 4 3 -5 3 4 3 -4"
        fill="none"
        stroke="#e7bd8c"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M82 47 l-3 -5 -3 4 -3 -5 -3 4 -3 -4"
        fill="none"
        stroke="#e7bd8c"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <g class="eyes">
        <g transform={gaze}>
          <ellipse cx="47" cy="56" rx="4.3" ry="4.7" fill="#24140f" />
          <ellipse cx="73" cy="56" rx="4.3" ry="4.7" fill="#24140f" />
          <circle cx="48.5" cy="54.3" r="1.4" fill="#fff" />
          <circle cx="74.5" cy="54.3" r="1.4" fill="#fff" />
        </g>
      </g>
      <path
        d="M77 75 L74.6 77.5 L75.3 80.6 L71.7 82.1 L70.6 85.2 L66.5 85.3 L63.8 87.7 L60 86.4 L56.2 87.7 L53.5 85.3 L49.4 85.2 L48.3 82.1 L44.7 80.6 L45.4 77.5 L43 75 L45.4 72.5 L44.7 69.4 L48.3 67.9 L49.4 64.8 L53.5 64.7 L56.2 62.3 L60 63.6 L63.8 62.3 L66.5 64.7 L70.6 64.8 L71.7 67.9 L75.3 69.4 L74.6 72.5 Z"
        fill="#e6b98a"
      />
      {#if happy}
        <path d="M55.5 79 Q60 91 64.5 79 Z" fill="#e2698d" />
      {/if}
      <path
        d="M60 73 V77.5 M60 77.5 Q55.5 81.5 51.5 78.5 M60 77.5 Q64.5 81.5 68.5 78.5"
        fill="none"
        stroke="#4a2a1c"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <path d="M53.5 67.5 Q60 63.5 66.5 67.5 Q65.5 73 60 74.5 Q54.5 73 53.5 67.5 Z" fill="#1e1210" />
      <ellipse cx="58" cy="66.6" rx="2" ry="1" fill="#5a4038" />
    </g>
  {:else}
    <!-- Miniature pinscher: sleek chocolate coat with tan points, tall upright ears -->
    <path d="M32 120 C33 101 45 92 60 92 C75 92 87 101 88 120 Z" fill="#6c3b27" />
    <path d="M50 96 Q60 104 70 96 L68 112 Q60 117 52 112 Z" fill="#d48a4f" />
    <path d="M40 99 Q60 109 80 99 L82 106 Q60 117 38 106 Z" fill="#f4a7be" />
    <circle cx="60" cy="113" r="4.6" fill="#c9a15a" stroke="#8a6424" stroke-width="1" />
    <g class="head" style:transform="rotate({tilt}deg)">
      <g class="ear ear-l">
        <path d="M37 47 L27 9 Q29 4 34 7 L55 33 Z" fill="#7b4630" />
        <path d="M39 41 L32 15 L49 34 Z" fill="#e0a080" />
      </g>
      <g class="ear ear-r">
        <path d="M83 47 L93 9 Q91 4 86 7 L65 33 Z" fill="#7b4630" />
        <path d="M81 41 L88 15 L71 34 Z" fill="#e0a080" />
      </g>
      <path
        d="M60 26 C78 26 88 38 88 54 C88 66 80 76 72 84 C68 89 64 92 60 92 C56 92 52 89 48 84 C40 76 32 66 32 54 C32 38 42 26 60 26 Z"
        fill="#7b4630"
      />
      <path d="M60 29 C64 40 64 56 60 66 C56 56 56 40 60 29 Z" fill="#8c5439" />
      <path
        d="M43 70 C47 65 54 65 60 67.5 C66 65 73 65 77 70 C77 80 69 91 60 91 C51 91 43 80 43 70 Z"
        fill="#d48a4f"
      />
      <ellipse cx="47" cy="44.5" rx="4.2" ry="2.6" fill="#d48a4f" />
      <ellipse cx="73" cy="44.5" rx="4.2" ry="2.6" fill="#d48a4f" />
      <g class="eyes">
        <g transform={gaze}>
          <ellipse cx="47" cy="53.5" rx="4.8" ry="5.2" fill="#1c0f0a" />
          <ellipse cx="73" cy="53.5" rx="4.8" ry="5.2" fill="#1c0f0a" />
          <circle cx="48.7" cy="51.6" r="1.6" fill="#fff" />
          <circle cx="74.7" cy="51.6" r="1.6" fill="#fff" />
        </g>
      </g>
      {#if happy}
        <path d="M56 81 Q60 92 64 81 Z" fill="#e2698d" />
      {/if}
      <path
        d="M60 77 V80 M60 80 Q56 83.5 52.5 81 M60 80 Q64 83.5 67.5 81"
        fill="none"
        stroke="#3a1d12"
        stroke-width="1.6"
        stroke-linecap="round"
      />
      <path d="M54 72.5 Q60 69.5 66 72.5 Q65 77.5 60 78.5 Q55 77.5 54 72.5 Z" fill="#1a0f0b" />
      <ellipse cx="58.2" cy="71.8" rx="1.8" ry="0.9" fill="#4d362e" />
    </g>
  {/if}
</svg>

<style>
  .dog {
    display: block;
    overflow: visible;
  }

  .head {
    transform-box: view-box;
    transform-origin: 60px 90px;
    transition: transform 420ms var(--ease-settle);
  }

  .eyes {
    transform-box: fill-box;
    transform-origin: center;
    animation: blink 5.2s infinite;
    animation-delay: var(--blink-delay);
  }

  .eyes g {
    transition: transform 220ms var(--ease-out-expo);
  }

  .ear {
    transform-box: fill-box;
  }

  .ear-l {
    transform-origin: 100% 100%;
    animation: twitch-l 7s infinite;
    animation-delay: var(--blink-delay);
  }

  .ear-r {
    transform-origin: 0% 100%;
  }

  @keyframes blink {
    0%,
    94%,
    100% {
      transform: scaleY(1);
    }
    96.5% {
      transform: scaleY(0.1);
    }
  }

  @keyframes twitch-l {
    0%,
    88%,
    100% {
      transform: rotate(0deg);
    }
    90% {
      transform: rotate(-9deg);
    }
    93% {
      transform: rotate(3deg);
    }
  }
</style>
