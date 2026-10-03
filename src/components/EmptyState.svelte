<script lang="ts">
  import type { Snippet } from 'svelte';
  import { randomBreed } from '../lib/dogs';
  import Dog from './Dog.svelte';

  interface Props {
    title: string;
    children?: Snippet;
  }
  let { title, children }: Props = $props();
  const breed = randomBreed();
</script>

<div class="empty">
  <Dog {breed} size={112} happy={false} tilt={-10} />
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
