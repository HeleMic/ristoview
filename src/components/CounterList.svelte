<script lang="ts">
  import { paths } from '../lib/router.svelte';
  import { catalogNumber, formatDate, lastVisit, restaurantScore, reviewsOf } from '../lib/stats';
  import { store } from '../lib/store.svelte';
  import type { Restaurant } from '../lib/types';
  import Icon from './Icon.svelte';
  import ScoreSeal from './ScoreSeal.svelte';

  interface Props {
    restaurants: Restaurant[];
    /** Wishlist entries carry no number and no score yet. */
    wishlist?: boolean;
  }
  let { restaurants, wishlist = false }: Props = $props();
</script>

<ol class="counter">
  {#each restaurants as r (r.id)}
    {@const last = lastVisit(store.data, r.id)}
    {@const visits = reviewsOf(store.data, r.id).length}
    <li>
      <a href={paths.restaurant(r.id)}>
        <span class="stub tabular" aria-label={wishlist ? 'Da provare' : `Numero ${r.number}`}>
          {#if wishlist}<Icon name="bookmark" size={18} />{:else}{catalogNumber(r.number)}{/if}
        </span>
        <span class="main">
          <span class="name">{r.name}</span>
          <span class="meta">
            {#if wishlist}
              {r.cuisine || 'Da provare'}
            {:else}
              {[r.cuisine, last ? formatDate(last) : null, visits > 1 ? `${visits} volte` : null]
                .filter(Boolean)
                .join(' · ')}
            {/if}
          </span>
        </span>
        {#if wishlist}
          <Icon name="chevron" size={18} />
        {:else}
          <ScoreSeal score={restaurantScore(store.data, r.id)} size={44} />
        {/if}
      </a>
    </li>
  {/each}
</ol>

<style>
  .counter {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 2px solid var(--color-cocoa);
    border-bottom: 2px solid var(--color-cocoa);
  }

  li + li {
    border-top: 1.5px dashed var(--color-line);
  }

  a {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 68px;
    padding: 8px 8px 8px 0;
    color: inherit;
    text-decoration: none;
    transition: background-color 160ms;
  }

  a:hover {
    background: var(--color-petal);
  }

  /* the ticket stub, torn off along a perforation */
  .stub {
    flex: none;
    align-self: stretch;
    display: grid;
    place-items: center;
    width: 62px;
    border-right: 2px dotted var(--color-stripe);
    font-size: 13px;
    font-weight: 750;
    color: var(--color-ribbon);
  }

  .main {
    flex: 1;
    min-width: 0;
    display: grid;
    gap: 1px;
  }

  .name {
    font-size: 18px;
    font-weight: 720;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .meta {
    font-size: 14px;
    color: var(--color-cocoa-soft);
  }
</style>
