<script lang="ts">
  interface Props {
    score: number | null;
    size?: number;
  }
  let { score, size = 48 }: Props = $props();

  const text = $derived(score === null ? '–' : score.toLocaleString('it-IT', { maximumFractionDigits: 1, minimumFractionDigits: 1 }));
  const tone = $derived(score === null ? 'none' : score >= 4.5 ? 'gold' : score >= 3.5 ? 'pink' : 'plain');
</script>

<span
  class="seal {tone}"
  style:--s="{size}px"
  role="img"
  aria-label={score === null ? 'Nessun voto' : `Voto medio ${text} su 5`}
>
  <span class="tabular">{text}</span>
</span>

<style>
  .seal {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--s);
    height: var(--s);
    border-radius: 50%;
    font-weight: 780;
    font-size: calc(var(--s) * 0.34);
    letter-spacing: -0.02em;
    /* scalloped rim drawn as a conic dash ring */
    background:
      radial-gradient(circle, var(--bg) 60%, transparent 61%),
      repeating-conic-gradient(var(--rim) 0 6deg, var(--bg) 6deg 12deg);
    color: var(--fg);
  }

  .gold {
    --bg: var(--color-gold);
    --rim: var(--color-gold-deep);
    --fg: var(--color-cocoa);
  }

  .pink {
    --bg: var(--color-stripe);
    --rim: var(--color-rose);
    --fg: var(--color-cocoa);
  }

  .plain {
    --bg: var(--color-petal);
    --rim: var(--color-line);
    --fg: var(--color-cocoa-soft);
  }

  .none {
    --bg: var(--color-blush);
    --rim: var(--color-line);
    --fg: var(--color-cocoa-mute);
  }
</style>
