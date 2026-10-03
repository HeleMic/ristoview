<script lang="ts">
  import { untrack } from 'svelte';
  import Icon from '../components/Icon.svelte';
  import PawRating from '../components/PawRating.svelte';
  import { addRestaurant, findRestaurantByName, linkGiftToRestaurant, saveReview } from '../lib/actions';
  import { celebrate } from '../lib/confetti';
  import { GIFT_CATEGORIES } from '../lib/gifts';
  import { paths, router } from '../lib/router.svelte';
  import { formatEuro, RATING_LABELS, todayIso } from '../lib/stats';
  import { store } from '../lib/store.svelte';
  import { RATING_KEYS, type Ratings } from '../lib/types';

  interface Props {
    restaurantId?: string;
    reviewId?: string;
  }
  let { restaurantId, reviewId }: Props = $props();

  // Snapshot at mount: a sync landing mid-typing must not wipe the form.
  const [rid, vid] = untrack(() => [restaurantId, reviewId]);
  const existing = vid ? store.data.reviews.find((v) => v.id === vid) : undefined;
  const fixedRestaurant = rid ? store.data.restaurants.find((r) => r.id === rid) : undefined;

  let name = $state('');
  let cuisine = $state('');
  let date = $state(existing?.date ?? todayIso());
  let dishes = $state(existing?.dishes ?? '');
  let ratings = $state<Ratings>({ ...(existing?.ratings ?? {}) });
  let waiters = $state(existing?.waiters ?? '');
  let welcomeNotes = $state(existing?.welcomeNotes ?? '');
  let bill = $state<number | null>(existing?.bill ?? null);
  let people = $state<number>(existing?.people ?? 2);
  let notes = $state(existing?.notes ?? '');
  let wouldReturn = $state<boolean | 'maybe' | undefined>(existing?.wouldReturn);
  const RETURN_OPTIONS = [
    { value: true, label: 'Sì, di sicuro' },
    { value: 'maybe', label: 'Forse' },
    { value: false, label: 'Una volta basta' },
  ] as const;
  let nameError = $state('');

  const match = $derived(fixedRestaurant ?? (name.trim() ? findRestaurantByName(name) : undefined));
  const isNewPlace = $derived(!fixedRestaurant && !!name.trim() && !match);
  const cuisines = $derived([
    ...new Set([
      ...GIFT_CATEGORIES.filter((c) => c.id !== 'sorpresa').map((c) => c.label),
      ...store.data.restaurants.map((r) => r.cuisine).filter((c): c is string => !!c),
    ]),
  ]);
  const perHead = $derived(bill && people > 1 ? bill / people : null);

  function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!fixedRestaurant && !name.trim()) {
      nameError = 'Serve almeno il nome del ristorante.';
      document.getElementById('rf-name')?.focus();
      return;
    }
    const target =
      match ??
      addRestaurant({
        name,
        cuisine: cuisine.trim() || undefined,
      });
    const clean = Object.fromEntries(Object.entries(ratings).filter(([, v]) => !!v)) as Ratings;
    saveReview(
      target.id,
      {
        date: date || undefined,
        author: store.config?.role,
        authorName: store.config?.name,
        dishes: dishes.trim() || undefined,
        ratings: Object.keys(clean).length ? clean : undefined,
        waiters: waiters.trim() || undefined,
        welcomeNotes: welcomeNotes.trim() || undefined,
        bill: bill ?? undefined,
        people: bill ? people : undefined,
        notes: notes.trim() || undefined,
        wouldReturn,
      },
      reviewId,
    );
    if (!reviewId) {
      linkGiftToRestaurant(target.id);
      celebrate();
    }
    router.go(paths.restaurant(target.id), true);
  }
</script>

<main class="page">
  <a class="back" href={fixedRestaurant ? paths.restaurant(fixedRestaurant.id) : paths.restaurants}>
    <Icon name="back" size={18} />
    {fixedRestaurant ? fixedRestaurant.name : 'Ristoranti'}
  </a>

  <h1 class="page-title">
    {#if reviewId}
      Modifica la visita
    {:else if fixedRestaurant}
      Com'è andata da <span class="accent">{fixedRestaurant.name}</span>?
    {:else}
      Una nuova cena
    {/if}
  </h1>
  <p class="intro">Serve solo il nome del ristorante. Tutto il resto, se ti va.</p>

  <form class="sheet lace-top" onsubmit={submit} novalidate>
    {#if !fixedRestaurant}
      <fieldset>
        <legend class="section-title">Dove</legend>
        <label class="field">
          <span>Ristorante <em class="req">obbligatorio</em></span>
          <input
            id="rf-name"
            class="input"
            list="rf-places"
            autocomplete="off"
            placeholder="Es. Trattoria da Mario"
            bind:value={name}
            oninput={() => (nameError = '')}
            aria-invalid={!!nameError}
            aria-describedby="rf-name-msg"
          />
          <datalist id="rf-places">
            {#each store.data.restaurants as r (r.id)}<option value={r.name}></option>{/each}
          </datalist>
          <span id="rf-name-msg" class="hint" class:error={!!nameError}>
            {#if nameError}
              {nameError}
            {:else if match}
              Già nella collezione: aggiungo una nuova visita.
            {:else if isNewPlace}
              Posto nuovo: entra nella collezione.
            {/if}
          </span>
        </label>
        {#if isNewPlace}
          <label class="field">
            <span>Tipo di ristorante</span>
              <input class="input" list="rf-cuisines" placeholder="Es. Sushi" bind:value={cuisine} />
              <datalist id="rf-cuisines">
                {#each cuisines as c (c)}<option value={c}></option>{/each}
              </datalist>
            </label>
        {/if}
      </fieldset>
    {/if}

    <fieldset>
      <legend class="section-title">La serata</legend>
      <label class="field date">
        <span>Quando</span>
        <input class="input" type="date" bind:value={date} max={todayIso()} />
      </label>
      <label class="field">
        <span>Cosa abbiamo mangiato</span>
        <textarea class="input" placeholder="Cosa avete ordinato" bind:value={dishes}></textarea>
      </label>
    </fieldset>

    <fieldset>
      <legend class="section-title">I voti</legend>
      <div class="ratings">
        {#each RATING_KEYS as k (k)}
          <PawRating label={RATING_LABELS[k]} value={ratings[k]} onchange={(v) => (ratings[k] = v)} />
        {/each}
      </div>
    </fieldset>

    <fieldset>
      <legend class="section-title">Come ci siamo trovati</legend>
      <label class="field">
        <span>Camerieri e servizio</span>
        <textarea class="input" placeholder="Simpatici, veloci, ci hanno consigliato il vino giusto…" bind:value={waiters}></textarea>
      </label>
      <label class="field">
        <span>Accoglienza</span>
        <textarea class="input" placeholder="Tavolo pronto? Ci hanno fatto aspettare?" bind:value={welcomeNotes}></textarea>
      </label>
      <label class="field">
        <span>Com'è andata, in generale</span>
        <textarea class="input" placeholder="Il ricordo della serata" bind:value={notes}></textarea>
      </label>
    </fieldset>

    <fieldset>
      <legend class="section-title">Il conto</legend>
      <div class="two bill">
        <label class="field">
          <span>Totale</span>
          <div class="euro">
            <input
              class="input tabular"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.5"
              placeholder="0"
              bind:value={bill}
            />
            <span aria-hidden="true">€</span>
          </div>
        </label>
        <label class="field">
          <span>Persone</span>
          <input class="input tabular" type="number" inputmode="numeric" min="1" step="1" bind:value={people} />
        </label>
      </div>
      {#if perHead}<p class="hint">Fanno {formatEuro(perHead)} a testa.</p>{/if}
    </fieldset>

    <fieldset>
      <legend class="section-title">Ci torneremmo?</legend>
      <div class="choice" role="radiogroup" aria-label="Ci torneremmo?">
        {#each RETURN_OPTIONS as opt (opt.label)}
          <label class:on={wouldReturn === opt.value}>
            <input
              type="radio"
              name="ret"
              checked={wouldReturn === opt.value}
              onclick={() => (wouldReturn = wouldReturn === opt.value ? undefined : opt.value)}
            />
            {opt.label}
          </label>
        {/each}
      </div>
    </fieldset>

    <div class="submit">
      <button type="submit" class="btn btn-primary">
        <Icon name="check" />
        {reviewId ? 'Salva le modifiche' : 'Salva la cena'}
      </button>
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

  .accent {
    color: var(--color-ribbon);
  }

  .intro {
    margin: 8px 0 8px;
    color: var(--color-cocoa-soft);
  }

  form {
    margin-top: 22px;
  }

  .req {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    color: var(--color-ribbon);
    margin-left: 4px;
  }

  .hint.error {
    color: var(--color-ribbon-deep);
    font-weight: 650;
  }

  .two {
    display: grid;
    gap: 14px;
  }

  @media (min-width: 560px) {
    .two {
      grid-template-columns: 1fr 1fr;
    }

    .two.bill {
      grid-template-columns: 2fr 1fr;
    }

    .date {
      max-width: 240px;
    }
  }

  .ratings {
    display: grid;
    gap: 10px;
  }

  @media (min-width: 620px) {
    .ratings {
      grid-template-columns: 1fr 1fr;
    }
  }

  .euro {
    position: relative;
  }

  .euro span {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-cocoa-soft);
    font-weight: 650;
  }

  .choice {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .choice label {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 18px;
    border-radius: 999px;
    box-shadow: inset 0 0 0 1.5px var(--color-line);
    font-weight: 650;
    cursor: pointer;
    transition: background-color 140ms;
  }

  .choice label.on {
    background: var(--color-cocoa);
    color: var(--color-paper);
    box-shadow: none;
  }

  .choice label:has(input:focus-visible) {
    outline: 3px solid var(--color-ribbon);
    outline-offset: 2px;
  }

  .choice input {
    position: absolute;
    opacity: 0;
    inset: 0;
    margin: 0;
    cursor: pointer;
  }

  .submit {
    position: sticky;
    z-index: 2;
    margin: 0 -18px;
    padding: 6px 18px 14px;
    bottom: calc(var(--tabbar-h) + 12px + env(safe-area-inset-bottom));
    display: flex;
    justify-content: flex-end;
  }

  @media (min-width: 900px) {
    .submit {
      bottom: 16px;
    }
  }

  .submit .btn {
    flex: 0 1 280px;
    box-shadow: var(--shadow-lift);
  }

  @media (max-width: 559px) {
    .submit .btn {
      flex: 1;
    }
  }
</style>
