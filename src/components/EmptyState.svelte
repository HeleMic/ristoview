<script lang="ts">
  import type { Snippet } from 'svelte';
  import { BIRD_NAME, DOG_NAMES, pick, randomBreed } from '../lib/dogs';
  import Dog from './Dog.svelte';
  import Lovebird from './Lovebird.svelte';

  interface Props {
    title: string;
    children?: Snippet;
  }
  let { title, children }: Props = $props();

  // One of the three keeps an eye on the empty page.
  const bird = Math.random() < 0.34;
  const breed = randomBreed();
  const caption = bird
    ? pick([
        `${BIRD_NAME} ha controllato due volte: niente.`,
        `${BIRD_NAME} fischia per riempire il silenzio.`,
        `${BIRD_NAME} aspetta sul trespolo.`,
      ])
    : pick([
        `${DOG_NAMES[breed]} ha annusato dappertutto.`,
        `${DOG_NAMES[breed]} aspetta, scodinzolando.`,
      ]);
</script>

<div class="empty">
  {#if bird}
    <Lovebird size={84} tilt={-14} />
  {:else}
    <Dog {breed} size={112} happy={false} tilt={-10} />
  {/if}
  <p class="caption">{caption}</p>
  <p class="title">{title}</p>
  {#if children}<div class="body">{@render children()}</div>{/if}
</div>

<style>
  .empty {
    display: grid;
    justify-items: center;
    gap: 10px;
    padding: 28px 16px 36px;
    text-align: center;
  }

  .caption {
    margin: -4px 0 4px;
    font-size: 14px;
    color: var(--color-cocoa-soft);
  }

  .title {
    margin: 0;
    font-size: 19px;
    font-weight: 720;
  }

  .body {
    display: grid;
    justify-items: center;
    gap: 14px;
    max-width: 36ch;
    color: var(--color-cocoa-soft);
  }

  .body :global(p) {
    margin: 0;
  }
</style>
