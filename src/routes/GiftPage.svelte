<script lang="ts">
  import { onMount } from 'svelte';
  import CounterList from '../components/CounterList.svelte';
  import GiftBox, { type BoxState } from '../components/GiftBox.svelte';
  import Icon from '../components/Icon.svelte';
  import { chooseGift, redeemGift, unredeemGift } from '../lib/actions';
  import { celebrate } from '../lib/confetti';
  import { BIRD_NAME, DOG_NAMES, randomBreed } from '../lib/dogs';
  import {
    categoryLabel,
    currentGift,
    daysLeftInMonth,
    GIFT_CATEGORIES,
    giftHistory,
    giftStatus,
    monthDeadline,
    monthLabel,
    monthKey,
  } from '../lib/gifts';
  import { paths } from '../lib/router.svelte';
  import { formatDate, lastVisit } from '../lib/stats';
  import { store } from '../lib/store.svelte';
  import { ui } from '../lib/ui.svelte';

  const breed = randomBreed();
  const dogName = DOG_NAMES[breed];
  const withBird = Math.random() < 0.6;
  const isLui = $derived(store.config?.role === 'lui');

  let view = $state<'box' | 'opening' | 'menu'>('box');
  let picked = $state<string | undefined>();
  let redeeming = $state(false);
  let redeemRestaurant = $state('');
  let justStamped = $state(false);

  const gift = $derived(currentGift(store.data));
  const status = $derived(giftStatus(gift));
  const nickname = $derived(store.data.settings.nickname);
  const month = $derived(monthLabel(monthKey()).split(' ')[0]);
  const history = $derived(giftHistory(store.data));
  const visited = $derived(
    [...store.data.restaurants].filter((r) => !r.wishlist).sort((a, b) => b.number - a.number),
  );
  const recent = $derived(
    [...visited]
      .sort((a, b) => (lastVisit(store.data, b.id) ?? b.createdAt).localeCompare(lastVisit(store.data, a.id) ?? a.createdAt))
      .slice(0, 3),
  );
  const linked = $derived(store.data.restaurants.find((r) => r.id === gift?.restaurantId));
  const nextMonth = $derived(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('it-IT', {
      month: 'long',
    }),
  );
  const daysLeft = daysLeftInMonth();

  const phase = $derived<BoxState>(
    view === 'opening' ? 'opening' : status === 'redeemed' ? 'stamped' : status === 'chosen' ? 'sealed' : 'closed',
  );

  function open() {
    view = 'opening';
    setTimeout(() => {
      picked = gift?.category;
      view = 'menu';
    }, 1250);
  }

  function confirmChoice() {
    if (!picked) return;
    chooseGift(picked);
    view = 'box';
    celebrate();
  }

  function confirmRedeem() {
    redeemGift(redeemRestaurant || undefined);
    redeeming = false;
    justStamped = true;
    setTimeout(() => celebrate(), 260);
  }

  /** Already reviewed this month's dinner? Then the button leads to the restaurant instead. */
  const reviewed = $derived(
    !!linked &&
      !!gift &&
      store.data.reviews.some((v) => v.restaurantId === linked.id && (v.date ?? v.createdAt) >= `${gift.month}-01`),
  );

  onMount(() => {
    if (ui.justSaidYes && status === 'unopened') {
      ui.justSaidYes = false;
      setTimeout(open, 500);
    }
  });
</script>

<main class="page">
  {#if isLui}
    <!-- His side: the gift is hers. He only sees where it stands, and can stamp it after dinner. -->
    <section class="lui">
      <h1 class="page-title">Il regalo di {month}</h1>
      <div class="sheet lace-top lui-sheet" aria-live="polite">
        <section>
          {#if status === 'unopened'}
            <p class="lui-big">{nickname ?? 'Lei'} non ha ancora aperto il pacchetto.</p>
            <p class="hint">Vale fino al {monthDeadline()}.</p>
          {:else if status === 'chosen'}
            <p class="lui-big">
              Ha scelto <strong>{gift?.category === 'sorpresa' ? 'a sorpresa: scegli tu' : categoryLabel(gift?.category)}</strong>.
            </p>
            <p class="hint">Può cambiare idea fino a quando non ci andate. Scade il {monthDeadline()}.</p>
            <div class="actions">
              <button class="btn btn-primary grow" onclick={confirmRedeem}><Icon name="check" /> Ci siamo andati</button>
            </div>
          {:else}
            <p class="lui-big">
              Sfruttato il {formatDate(gift?.redeemedAt)}{linked ? ` da ${linked.name}` : ''}.
            </p>
            <p class="hint">Il prossimo pacchetto arriva il 1° {nextMonth}.</p>
            <button class="undo" onclick={unredeemGift}>Annulla il timbro</button>
          {/if}
        </section>
      </div>
      <p class="guard">
        {#if withBird}
          {BIRD_NAME} giura che non le dirà niente.
        {:else}
          {dogName} sa mantenere un segreto.
        {/if}
      </p>
    </section>
  {:else if view === 'menu'}
    <section class="menu" aria-labelledby="menu-title">
      <header class="menu-head">
        <h1 id="menu-title" class="page-title">Cosa ti va di mangiare?</h1>
        <p class="lede">
          Scegli la cena di {month}. Puoi cambiare idea finché non ci andiamo.
        </p>
      </header>

      <div class="listino lace-top" role="radiogroup" aria-labelledby="menu-title">
        {#each GIFT_CATEGORIES as c, i (c.id)}
          <label class="item" class:on={picked === c.id} style:--i={i}>
            <input type="radio" name="gift" value={c.id} bind:group={picked} />
            <span class="name">{c.label}</span>
            <span class="mark" aria-hidden="true"><Icon name="check" size={16} stroke={3} /></span>
          </label>
        {/each}
      </div>

      <div class="actions sticky">
        {#if gift?.category}
          <button class="btn btn-ghost" onclick={() => (view = 'box')}>Lascia com'era</button>
        {/if}
        <button class="btn btn-ribbon grow" disabled={!picked} onclick={confirmChoice}>
          {picked ? `Scelgo ${categoryLabel(picked).toLocaleLowerCase('it')}` : 'Scegli una cena'}
        </button>
      </div>
    </section>
  {:else}
    <section class="hero" aria-live="polite">
      <header>
        {#if status === 'redeemed'}
          <h1 class="page-title">Il regalo di {month} è andato</h1>
          <p class="lede">
            Sfruttato il {formatDate(gift?.redeemedAt)}{linked ? ` da ${linked.name}` : ''}. Il prossimo
            pacchetto arriva il 1° {nextMonth}.
          </p>
        {:else if status === 'chosen'}
          <h1 class="page-title">
            {#if gift?.category === 'sorpresa'}
              Si va dove dico io
            {:else}
              Si va a mangiare <span class="choice">{categoryLabel(gift?.category).toLocaleLowerCase('it')}</span>
            {/if}
          </h1>
          <p class="lede">
            Puoi cambiare idea finché non ci andiamo. Il regalo scade il {monthDeadline()}{daysLeft <= 7
              ? daysLeft === 0
                ? ': cioè oggi!'
                : `, mancano ${daysLeft} giorni.`
              : '.'}
          </p>
        {:else}
          <h1 class="page-title">
            {#if nickname}
              <span class="script nick">{nickname},</span> c'è un pacchetto per te
            {:else}
              C'è un pacchetto per te
            {/if}
          </h1>
          <p class="lede">
            Il regalo di {month}: una cena fuori, decidi tu cosa. Vale fino al {monthDeadline()}.
          </p>
        {/if}
      </header>

      <GiftBox
        {phase}
        {breed}
        bird={withBird}
        seal={gift?.category === 'sorpresa' ? 'Sorpresa' : categoryLabel(gift?.category)}
      />

      <p class="guard">
        {#if view === 'opening'}
          {dogName} non sta più nella pelle{withBird ? `, ${BIRD_NAME} è volato via` : ''}.
        {:else if status === 'unopened'}
          {withBird ? `${dogName} e ${BIRD_NAME} fanno` : `${dogName} fa`} la guardia al pacchetto.
        {:else if status === 'chosen'}
          {dogName} approva la scelta{withBird ? `, ${BIRD_NAME} anche` : ''}.
        {:else}
          {dogName} sogna già gli avanzi{withBird ? `, ${BIRD_NAME} le briciole` : ''}.
        {/if}
      </p>

      <div class="actions">
        {#if status === 'unopened'}
          <button class="btn btn-ribbon grow" onclick={open} disabled={view === 'opening'}>
            <Icon name="gift" />
            {view === 'opening' ? 'Lo stai aprendo…' : 'Tira il nastro'}
          </button>
        {:else if status === 'chosen' && !redeeming}
          <button class="btn btn-ghost" onclick={() => (view = 'menu', (picked = gift?.category))}>
            Cambia scelta
          </button>
          <button class="btn btn-primary grow" onclick={() => (redeeming = true)}>
            <Icon name="check" /> Ci siamo andati
          </button>
        {:else if status === 'redeemed'}
          {#if linked && reviewed}
            <a class="btn btn-ghost grow" href={paths.restaurant(linked.id)}>
              <Icon name="cloche" /> Rileggi {linked.name}
            </a>
          {:else}
            <a class="btn btn-primary grow" href={linked ? paths.review(linked.id) : paths.new}>
              <Icon name="pencil" />
              {linked ? `Racconta com'era ${linked.name}` : 'Scrivi la recensione'}
            </a>
          {/if}
        {/if}
      </div>

      {#if redeeming}
        <form
          class="redeem lace-top"
          onsubmit={(e) => {
            e.preventDefault();
            confirmRedeem();
          }}
        >
          <p class="redeem-q">{visited.length ? 'Dove siete stati?' : 'Siete andati a cena?'}</p>
          {#if visited.length}
            <label class="field">
              <span>Ristorante (facoltativo)</span>
              <select class="input" bind:value={redeemRestaurant}>
                <option value="">Non è ancora nella collezione</option>
                {#each visited as r (r.id)}
                  <option value={r.id}>{r.name}</option>
                {/each}
              </select>
            </label>
          {/if}
          <p class="hint">
            Dopo il timbro la scelta non si può più cambiare.{visited.length
              ? ''
              : ' Il ristorante lo aggiungi dopo, con la recensione.'}
          </p>
          <div class="actions">
            <button type="button" class="btn btn-ghost" onclick={() => (redeeming = false)}>Annulla</button>
            <button type="submit" class="btn btn-ribbon grow">Timbra il regalo</button>
          </div>
        </form>
      {/if}

      {#if status === 'redeemed'}
        <button class="undo" onclick={unredeemGift}>
          {justStamped ? 'Timbrato per sbaglio? Annulla' : 'Annulla il timbro'}
        </button>
      {/if}
    </section>

  {/if}

  {#if view !== 'menu'}
    {#if recent.length}
      <section class="recent" aria-labelledby="recent-title">
        <div class="sec-head">
          <h2 id="recent-title" class="section-title">Le ultime cene</h2>
          <a href={paths.restaurants}>Tutte</a>
        </div>
        <CounterList restaurants={recent} />
      </section>
    {/if}

    {#if history.length}
      <section class="history" aria-labelledby="history-title">
        <h2 id="history-title" class="section-title">I regali passati</h2>
        <ul>
          {#each history as g (g.id)}
            {@const st = giftStatus(g)}
            {@const where = store.data.restaurants.find((r) => r.id === g.restaurantId)}
            <li>
              <span class="h-month">{monthLabel(g.month)}</span>
              <span class="h-what" class:struck={st === 'expired'}>
                {g.category ? categoryLabel(g.category) : 'Mai aperto'}
                {#if where}<a href={paths.restaurant(where.id)}>· {where.name}</a>{/if}
              </span>
              {#if st === 'redeemed'}
                <span class="mini-stamp">sfruttato</span>
              {:else}
                <span class="mini-expired">scaduto</span>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  {/if}
</main>

<style>
  header {
    display: grid;
    gap: 8px;
    margin-bottom: 18px;
  }

  .lede {
    margin: 0;
    max-width: 46ch;
    color: var(--color-cocoa-soft);
    font-size: 17px;
  }

  .nick {
    display: block;
    color: var(--color-ribbon);
    font-size: 1.3em;
    line-height: 1;
    margin-bottom: 2px;
  }

  .choice {
    color: var(--color-ribbon);
  }

  .hero {
    display: grid;
    gap: 22px;
    overflow-x: clip;
    overflow-y: visible;
  }

  .lui {
    display: grid;
    gap: 16px;
  }

  .lui-sheet section {
    gap: 10px;
  }

  .lui-big {
    margin: 0;
    font-size: 20px;
    font-weight: 650;
  }

  .lui-big strong {
    color: var(--color-ribbon);
  }

  .guard {
    margin: -8px 0 0;
    text-align: center;
    font-size: 14px;
    color: var(--color-cocoa-soft);
  }

  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .actions .grow {
    flex: 1 1 200px;
  }

  .actions a {
    text-decoration: none;
  }

  .redeem {
    display: grid;
    gap: 14px;
    padding: 18px;
    border-radius: var(--radius);
    background: var(--color-paper);
    box-shadow: var(--shadow-soft);
    animation: rise 420ms var(--ease-out-expo) both;
  }

  .redeem-q {
    margin: 0;
    font-weight: 700;
    font-size: 18px;
  }

  .undo {
    justify-self: center;
    border: 0;
    background: none;
    color: var(--color-cocoa-soft);
    font-size: 14px;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    padding: 8px;
  }

  /* ---------- Listino ---------- */

  .menu-head {
    margin-bottom: 14px;
  }

  .listino {
    position: relative;
    display: grid;
    padding: 26px 8px 14px;
    border-radius: 4px 4px var(--radius) var(--radius);
    background: var(--color-paper);
    box-shadow: var(--shadow-soft);
  }


  @media (min-width: 620px) {
    .listino {
      grid-template-columns: 1fr 1fr;
      column-gap: 18px;
    }
  }

  .item {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 28px;
    align-items: center;
    column-gap: 8px;
    min-height: 52px;
    padding: 6px 12px;
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 160ms;
    animation: rise 520ms var(--ease-out-expo) both;
    animation-delay: calc(var(--i) * 28ms);
  }

  .item:hover {
    background: var(--color-blush);
  }

  .item.on {
    background: var(--color-petal);
  }

  .item:has(input:focus-visible) {
    outline: 3px solid var(--color-ribbon);
    outline-offset: -3px;
  }

  .item input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .name {
    grid-column: 1;
    font-weight: 700;
    font-size: 18px;
  }

  .mark {
    grid-column: 2;
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    color: var(--color-cocoa);
    background: var(--color-gold);
    transform: scale(0);
    transition: transform 280ms var(--ease-settle);
  }

  .item.on .mark {
    transform: scale(1);
  }

  .sticky {
    position: sticky;
    bottom: calc(var(--tabbar-h) + 12px + env(safe-area-inset-bottom));
    margin-top: 16px;
    padding: 10px;
    border-radius: 999px;
    background: rgb(253 238 242 / 0.86);
    backdrop-filter: blur(8px);
  }

  @media (min-width: 900px) {
    .sticky {
      bottom: 16px;
    }
  }

  /* ---------- Recent dinners ---------- */

  .recent {
    margin-top: 44px;
  }

  .sec-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .sec-head a {
    font-weight: 650;
  }

  /* ---------- History ---------- */

  .history {
    margin-top: 40px;
  }

  .history ul {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    border-top: 1.5px solid var(--color-line);
  }

  .history li {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2px 12px;
    align-items: center;
    padding: 12px 2px;
    border-bottom: 1.5px solid var(--color-line);
  }

  .h-month {
    font-weight: 700;
    text-transform: capitalize;
  }

  .h-what {
    grid-row: 2;
    color: var(--color-cocoa-soft);
    font-size: 15px;
  }

  .h-what a {
    color: inherit;
  }

  .struck {
    text-decoration: line-through;
    text-decoration-thickness: 2px;
    text-decoration-color: var(--color-cocoa-mute);
  }

  .mini-stamp,
  .mini-expired {
    grid-column: 2;
    grid-row: 1 / 3;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .mini-stamp {
    padding: 3px 8px 2px;
    border: 3px double var(--color-ribbon-deep);
    border-radius: 6px;
    color: var(--color-ribbon-deep);
    transform: rotate(-8deg);
    filter: url(#stamp-ink);
  }

  .mini-expired {
    color: var(--color-cocoa-mute);
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
  }
</style>
