<script lang="ts">
  import CounterList from '../components/CounterList.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import Icon from '../components/Icon.svelte';
    import { paths } from '../lib/router.svelte';
  import { formatEuro, lastVisit, restaurantScore, summary } from '../lib/stats';
  import { store } from '../lib/store.svelte';

  let tab = $state<'visited' | 'wishlist'>('visited');
  let query = $state('');
  let sort = $state<'recent' | 'score' | 'number'>('recent');

  const visited = $derived(store.data.restaurants.filter((r) => !r.wishlist));
  const wishlist = $derived(store.data.restaurants.filter((r) => r.wishlist));
  const stats = $derived(summary(store.data));

  const rows = $derived.by(() => {
    const q = query.trim().toLocaleLowerCase('it');
    const source = tab === 'visited' ? visited : wishlist;
    const list = source
      .filter(
        (r) =>
          !q ||
          r.name.toLocaleLowerCase('it').includes(q) ||
          (r.cuisine ?? '').toLocaleLowerCase('it').includes(q),
      )
      .map((r) => ({
        r,
        score: restaurantScore(store.data, r.id),
        last: lastVisit(store.data, r.id),
      }));
    if (sort === 'score') list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    else if (sort === 'number') list.sort((a, b) => a.r.number - b.r.number);
    else list.sort((a, b) => (b.last ?? b.r.createdAt).localeCompare(a.last ?? a.r.createdAt));
    return list;
  });
</script>

<main class="page">
  <header class="head">
    <h1 class="page-title">Le nostre cene</h1>
    {#if stats.dinners > 0}
      <p class="summary">
        <strong>{stats.dinners}</strong>
        {stats.dinners === 1 ? 'cena' : 'cene'} in <strong>{stats.places}</strong>
        {stats.places === 1 ? 'posto' : 'posti'}{#if stats.spent > 0}, <strong class="tabular">{formatEuro(stats.spent)}</strong> in tutto{/if}.
        {#if stats.favouriteCuisine}La cucina che torna di più: <strong>{stats.favouriteCuisine}</strong>.{/if}
        {#if stats.best}Il preferito finora: <a href={paths.restaurant(stats.best.id)}>{stats.best.name}</a>.{/if}
      </p>
    {/if}
  </header>

  <div class="tabs" role="tablist" aria-label="Elenco">
    <button role="tab" aria-selected={tab === 'visited'} onclick={() => (tab = 'visited')}>
      Ci siamo stati <span class="count tabular">{visited.length}</span>
    </button>
    <button role="tab" aria-selected={tab === 'wishlist'} onclick={() => (tab = 'wishlist')}>
      Da provare <span class="count tabular">{wishlist.length}</span>
    </button>
  </div>

  {#if (tab === 'visited' ? visited : wishlist).length > 0}
    <div class="tools">
      <label class="search">
        <span class="sr-only">Cerca</span>
        <Icon name="search" size={18} />
        <input class="input" type="search" placeholder="Cerca per nome o tipo" bind:value={query} />
      </label>
      {#if tab === 'visited'}
        <label class="sort">
          <span class="sr-only">Ordina</span>
          <select class="input" bind:value={sort}>
            <option value="recent">Più recenti</option>
            <option value="score">Voto più alto</option>
            <option value="number">Numero di collezione</option>
          </select>
        </label>
      {/if}
    </div>
  {/if}

  {#if tab === 'visited'}
    {#if visited.length === 0}
      <EmptyState title="Ancora nessuna cena registrata">
        <p>La prima recensione inaugura la collezione: diventa il N°001.</p>
        <a class="btn btn-primary" href={paths.new}><Icon name="plus" /> Aggiungi una cena</a>
      </EmptyState>
    {:else if rows.length === 0}
      <EmptyState title="Nessun risultato">
        <p>Niente che corrisponda a «{query}».</p>
      </EmptyState>
    {:else}
      <div class="list"><CounterList restaurants={rows.map((x) => x.r)} /></div>
    {/if}
  {:else}
    {#if wishlist.length === 0}
      <EmptyState title="La lista dei desideri è vuota">
        <p>Segnate qui i posti che volete provare: torneranno utili per il regalo del mese.</p>
      </EmptyState>
    {:else}
      <div class="list"><CounterList restaurants={rows.map((x) => x.r)} wishlist /></div>
    {/if}
    <div class="add-wish">
      <a class="btn btn-ghost" href={paths.restaurantEdit('nuovo')}><Icon name="bookmark" size={18} /> Aggiungi un posto da provare</a>
    </div>
  {/if}
</main>

<style>
  .head {
    display: grid;
    gap: 8px;
    margin-bottom: 18px;
  }

  .summary {
    margin: 0;
    max-width: 58ch;
    color: var(--color-cocoa-soft);
  }

  .summary strong {
    color: var(--color-cocoa);
    font-weight: 720;
  }

  .tabs {
    display: inline-flex;
    padding: 4px;
    gap: 4px;
    border-radius: 999px;
    background: var(--color-petal);
  }

  .tabs button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 16px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    font-weight: 650;
    color: var(--color-cocoa-soft);
    cursor: pointer;
  }

  .tabs button[aria-selected='true'] {
    background: var(--color-paper);
    color: var(--color-cocoa);
    box-shadow: var(--shadow-soft);
  }

  .count {
    font-size: 13px;
    color: var(--color-cocoa-mute);
  }

  .tools {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .search {
    position: relative;
    flex: 1 1 220px;
    color: var(--color-cocoa-mute);
  }

  .search :global(svg) {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
  }

  .search .input {
    padding-left: 42px;
  }

  .sort {
    flex: 0 1 200px;
  }

  .list {
    margin-top: 18px;
  }

  .add-wish {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .add-wish a {
    text-decoration: none;
  }
</style>
