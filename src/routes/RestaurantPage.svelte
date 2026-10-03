<script lang="ts">
  import ConfirmButton from '../components/ConfirmButton.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import Icon from '../components/Icon.svelte';
  import PawRating from '../components/PawRating.svelte';
  import ScoreSeal from '../components/ScoreSeal.svelte';
  import { deleteRestaurant, deleteReview } from '../lib/actions';
  import { paths, router } from '../lib/router.svelte';
  import {
    catalogNumber,
    formatDate,
    formatEuro,
    RATING_LABELS,
    restaurantScore,
    reviewsOf,
  } from '../lib/stats';
  import { store } from '../lib/store.svelte';
  import { RATING_KEYS } from '../lib/types';

  interface Props {
    id: string;
  }
  let { id }: Props = $props();

  const restaurant = $derived(store.data.restaurants.find((r) => r.id === id));
  const reviews = $derived(reviewsOf(store.data, id));
  const score = $derived(restaurantScore(store.data, id));
  const mapsHref = $derived(
    restaurant?.mapsUrl ||
      (restaurant ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}` : undefined),
  );

  const RETURN_LABEL = { true: 'Sì, ci torniamo', false: 'Una volta basta' } as const;

  function remove() {
    deleteRestaurant(id);
    router.go(paths.restaurants, true);
  }
</script>

<main class="page">
  <a class="back" href={paths.restaurants}><Icon name="back" size={18} /> Ristoranti</a>

  {#if !restaurant}
    <EmptyState title="Questo ristorante non c'è più">
      <p>Forse è stato eliminato da un altro dispositivo.</p>
      <a class="btn btn-ghost" href={paths.restaurants}>Torna all'elenco</a>
    </EmptyState>
  {:else}
    <header class="head">
      <div class="title-row">
        <div class="titles">
          <h1 class="page-title">
            {restaurant.name}
            {#if !restaurant.wishlist}<span class="num tabular">{catalogNumber(restaurant.number)}</span>{/if}
          </h1>
        </div>
        {#if !restaurant.wishlist}<ScoreSeal {score} size={64} />{/if}
      </div>
      {#if restaurant.cuisine || restaurant.wishlist || mapsHref}
        <p class="meta">
          {#if restaurant.wishlist}<span class="chip">Da provare</span>{/if}
          {#if restaurant.cuisine}<span>{restaurant.cuisine}</span>{/if}
          {#if mapsHref}
            <a href={mapsHref} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={16} /> Mappa</a>
          {/if}
        </p>
      {/if}
      {#if restaurant.notes}<p class="notes">{restaurant.notes}</p>{/if}

      <div class="actions">
        <a class="btn btn-primary" href={paths.review(restaurant.id)}>
          <Icon name="plus" />
          {restaurant.wishlist ? 'Ci siamo stati' : 'Nuova visita'}
        </a>
        <a class="btn btn-ghost" href={paths.restaurantEdit(restaurant.id)}><Icon name="pencil" size={18} /> Modifica</a>
      </div>
    </header>

    {#if reviews.length === 0}
      <EmptyState title={restaurant.wishlist ? 'Non ci siete ancora stati' : 'Nessuna recensione'}>
        <p>Quando ci andate, raccontate qui com'è andata.</p>
      </EmptyState>
    {:else}
      <section aria-label="Visite" class="visits">
        {#each reviews as v (v.id)}
          <article class="visit">
            <header class="v-head">
              <h2 class="v-date">{v.date ? formatDate(v.date) : 'Senza data'}</h2>
              <span class="v-by">{v.authorName || v.author ? `scritta da ${v.authorName || v.author}` : ''}</span>
              <a class="v-edit" href={paths.review(restaurant.id, v.id)} aria-label="Modifica questa recensione">
                <Icon name="pencil" size={18} />
              </a>
            </header>

            {#if v.ratings && Object.values(v.ratings).some(Boolean)}
              <dl class="ratings">
                {#each RATING_KEYS as k (k)}
                  {#if v.ratings[k]}
                    <div>
                      <dt>{RATING_LABELS[k]}</dt>
                      <dd><PawRating readonly label={RATING_LABELS[k]} value={v.ratings[k]} size={20} /></dd>
                    </div>
                  {/if}
                {/each}
              </dl>
            {/if}

            {#if v.dishes}
              <div class="block"><h3>Cosa abbiamo mangiato</h3><p>{v.dishes}</p></div>
            {/if}
            {#if v.waiters}
              <div class="block"><h3>Camerieri e servizio</h3><p>{v.waiters}</p></div>
            {/if}
            {#if v.welcomeNotes}
              <div class="block"><h3>Accoglienza</h3><p>{v.welcomeNotes}</p></div>
            {/if}
            {#if v.notes}
              <div class="block"><h3>Com'è andata</h3><p>{v.notes}</p></div>
            {/if}

            {#if v.bill || v.wouldReturn !== undefined}
              <footer class="v-foot">
                {#if v.bill}
                  <span class="bill tabular">
                    <Icon name="receipt" size={18} />
                    {formatEuro(v.bill)}
                    {#if v.people && v.people > 1}<span class="per">· {formatEuro(v.bill / v.people)} a testa</span>{/if}
                  </span>
                {/if}
                {#if v.wouldReturn !== undefined}
                  <span class="return" class:yes={v.wouldReturn}>{RETURN_LABEL[`${v.wouldReturn}`]}</span>
                {/if}
              </footer>
            {/if}

            <div class="v-delete">
              <ConfirmButton
                label="Elimina visita"
                question="Eliminare questa visita?"
                confirmLabel="Elimina"
                onconfirm={() => deleteReview(v.id)}
              />
            </div>
          </article>
        {/each}
      </section>
    {/if}

    <div class="danger">
      <ConfirmButton
        label="Elimina ristorante"
        question="Eliminare il ristorante e tutte le sue recensioni?"
        confirmLabel="Elimina tutto"
        onconfirm={remove}
      />
    </div>
  {/if}
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

  .head {
    display: grid;
    gap: 10px;
    margin-bottom: 24px;
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    justify-content: space-between;
  }

  .titles {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .titles h1 {
    overflow-wrap: anywhere;
  }

  .num {
    margin-left: 6px;
    font-size: 0.42em;
    font-weight: 750;
    letter-spacing: 0;
    color: var(--color-ribbon);
    vertical-align: 0.35em;
    white-space: nowrap;
  }

  .chip {
    padding: 2px 10px;
    border-radius: 999px;
    background: var(--color-petal);
    color: var(--color-ribbon-deep);
    font-size: 14px;
    font-weight: 650;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin: 0;
    color: var(--color-cocoa-soft);
  }

  .meta a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .notes {
    margin: 0;
    max-width: 60ch;
  }

  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .actions a {
    text-decoration: none;
  }

  .visits {
    display: grid;
    gap: 16px;
  }

  .visit {
    position: relative;
    display: grid;
    gap: 14px;
    padding: 20px 18px 16px;
    border-radius: var(--radius);
    background: var(--color-paper);
    box-shadow: var(--shadow-soft);
  }

  .v-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    padding-right: 40px;
  }

  .v-date {
    font-size: 19px;
    font-weight: 740;
  }

  .v-by {
    font-size: 14px;
    color: var(--color-cocoa-mute);
  }

  .v-edit {
    position: absolute;
    top: 12px;
    right: 12px;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: var(--color-cocoa-soft);
  }

  .v-edit:hover {
    background: var(--color-blush);
  }

  .ratings {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 6px 18px;
    margin: 0;
  }

  .ratings div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .ratings dt {
    font-size: 14px;
    font-weight: 650;
    color: var(--color-cocoa-soft);
  }

  .ratings dd {
    margin: 0;
  }

  .block h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-cocoa-soft);
    margin-bottom: 2px;
  }

  .block p {
    margin: 0;
    white-space: pre-line;
    max-width: 65ch;
  }

  .v-foot {
    display: flex;
    align-items: center;
    gap: 10px 18px;
    flex-wrap: wrap;
    padding-top: 12px;
    border-top: 1.5px dashed var(--color-line);
  }

  .bill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 720;
  }

  .per {
    font-weight: 500;
    color: var(--color-cocoa-soft);
  }

  .return {
    padding: 4px 12px;
    border-radius: 999px;
    background: var(--color-blush);
    font-size: 14px;
    font-weight: 650;
    color: var(--color-cocoa-soft);
  }

  .return.yes {
    background: var(--color-petal);
    color: var(--color-ribbon-deep);
  }

  .v-delete {
    display: flex;
    justify-content: flex-end;
  }

  .danger {
    display: flex;
    justify-content: center;
    margin-top: 36px;
  }
</style>
