<script lang="ts">
  import { untrack } from 'svelte';
  import Icon from '../components/Icon.svelte';
  import { addRestaurant, findRestaurantByName, updateRestaurant } from '../lib/actions';
  import { paths, router } from '../lib/router.svelte';
  import { store } from '../lib/store.svelte';

  interface Props {
    /** "nuovo" adds a place to the wishlist. */
    id: string;
  }
  let { id }: Props = $props();

  // The page is re-created on every route change, so reading the props once is intended.
  const creating = untrack(() => id) === 'nuovo';
  const existing = creating ? undefined : store.data.restaurants.find((r) => r.id === untrack(() => id));

  let name = $state(existing?.name ?? '');
  let cuisine = $state(existing?.cuisine ?? '');
  let mapsUrl = $state(existing?.mapsUrl ?? '');
  let notes = $state(existing?.notes ?? '');
  let wishlist = $state(existing?.wishlist ?? creating);
  let error = $state('');

  function submit(e: SubmitEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      error = 'Il nome serve.';
      return;
    }
    const clash = findRestaurantByName(trimmed);
    if (clash && clash.id !== existing?.id) {
      error = `«${clash.name}» è già nella collezione.`;
      return;
    }
    const fields = {
      name: trimmed,
      cuisine: cuisine.trim() || undefined,
      mapsUrl: mapsUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      wishlist,
    };
    if (existing) {
      updateRestaurant(existing.id, fields);
      router.go(paths.restaurant(existing.id), true);
    } else {
      const r = addRestaurant(fields);
      router.go(paths.restaurant(r.id), true);
    }
  }
</script>

<main class="page">
  <a class="back" href={existing ? paths.restaurant(existing.id) : paths.restaurants}>
    <Icon name="back" size={18} /> {existing ? existing.name : 'Ristoranti'}
  </a>
  <h1 class="page-title">{creating ? 'Un posto da provare' : 'Modifica ristorante'}</h1>

  <form class="group" onsubmit={submit} novalidate>
    <label class="field">
      <span>Nome</span>
      <input class="input" bind:value={name} oninput={() => (error = '')} aria-invalid={!!error} aria-describedby="re-err" />
      <span id="re-err" class="hint error">{error}</span>
    </label>
    <label class="field">
      <span>Tipo di ristorante</span>
      <input class="input" placeholder="Es. Pesce" bind:value={cuisine} />
    </label>
    <label class="field">
      <span>Link Google Maps</span>
      <input class="input" type="url" inputmode="url" placeholder="https://maps.app.goo.gl/…" bind:value={mapsUrl} />
      <span class="hint">Se lo lasci vuoto, la mappa cerca il nome.</span>
    </label>
    <label class="field">
      <span>Note</span>
      <textarea class="input" placeholder="Chi ce l'ha consigliato, cosa ordinare…" bind:value={notes}></textarea>
    </label>
    {#if !creating}
      <label class="check">
        <input type="checkbox" bind:checked={wishlist} />
        <span>Ancora da provare</span>
      </label>
    {/if}
    <div class="submit">
      <button class="btn btn-primary" type="submit"><Icon name="check" /> Salva</button>
    </div>
  </form>
</main>

<style>
  .back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin: -4px 0 14px -6px;
    padding: 6px;
    color: var(--color-cocoa-soft);
    font-weight: 650;
    text-decoration: none;
  }

  .group {
    display: grid;
    gap: 16px;
    margin-top: 18px;
    padding: 18px 16px;
    border-radius: var(--radius);
    background: var(--color-paper);
    box-shadow: var(--shadow-soft);
  }

  .hint.error {
    color: var(--color-ribbon-deep);
    font-weight: 650;
    min-height: 1.2em;
  }

  .check {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    font-weight: 650;
  }

  .check input {
    width: 22px;
    height: 22px;
  }

  .submit {
    display: flex;
    justify-content: flex-end;
  }

  .submit .btn {
    flex: 0 1 240px;
  }
</style>
