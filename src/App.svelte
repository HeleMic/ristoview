<script lang="ts">
  import { onMount } from 'svelte';
  import AppNav from './components/AppNav.svelte';
  import Dog from './components/Dog.svelte';
  import { markEasterEggSeen } from './lib/actions';
  import { DOG_NAMES, randomBreed } from './lib/dogs';
  import { paths, router } from './lib/router.svelte';
  import { store } from './lib/store.svelte';
  import { ui } from './lib/ui.svelte';
  import EasterEgg from './routes/EasterEgg.svelte';
  import GiftPage from './routes/GiftPage.svelte';
  import RestaurantEdit from './routes/RestaurantEdit.svelte';
  import RestaurantPage from './routes/RestaurantPage.svelte';
  import RestaurantsPage from './routes/RestaurantsPage.svelte';
  import ReviewForm from './routes/ReviewForm.svelte';
  import SettingsPage from './routes/SettingsPage.svelte';
  import Setup from './routes/Setup.svelte';

  /** Set right after setup on her device: he decides whether the surprise starts now or next time. */
  let justConnected = $state(false);
  let eggDeferred = $state(false);
  const loadingDog = randomBreed();

  const eggPending = $derived(store.config?.role === 'lei' && !store.data.settings.easterEggSeen);
  const showEgg = $derived(ui.previewEasterEgg || (eggPending && store.settled && !justConnected && !eggDeferred));
  // Her first open waits for GitHub, so a stale cache never replays (or skips) the surprise.
  const waiting = $derived(!store.ready || (eggPending && !store.settled));
  const route = $derived(router.route);

  function onYes() {
    if (ui.previewEasterEgg) ui.previewEasterEgg = false;
    else markEasterEggSeen();
    ui.justSaidYes = true;
    router.go(paths.gift);
  }

  function onConnected() {
    if (store.config?.role === 'lei' && !store.data.settings.easterEggSeen) justConnected = true;
    router.go(paths.gift, true);
  }

  onMount(() => {
    void store.init();
  });
</script>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <filter id="stamp-ink">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
    <feColorMatrix
      in="noise"
      type="matrix"
      values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.45"
      result="speckle"
    />
    <feComposite in="SourceGraphic" in2="speckle" operator="in" result="inked" />
    <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" seed="3" result="warp" />
    <feDisplacementMap in="inked" in2="warp" scale="2.4" />
  </filter>
</svg>

{#if !store.config}
  <Setup onconnected={onConnected} />
{:else if waiting}
  <div class="loading" role="status">
    <Dog breed={loadingDog} size={120} tilt={-8} />
    <p>{DOG_NAMES[loadingDog]} sta aprendo la pasticceria…</p>
  </div>
{:else if justConnected}
  <div class="loading ready">
    <div class="pair" aria-hidden="true">
      <Dog breed="norfolk" size={104} />
      <Dog breed="pinscher" size={104} />
    </div>
    <h1 class="page-title">Tutto pronto</h1>
    <p>
      Questo dispositivo è collegato ed è di lei. Momo, Lilla e Pachino aspettano: la sorpresa partirà la prossima
      volta che apre ristoview qui.
    </p>
    <div class="ready-actions">
      <button class="btn btn-ghost" onclick={() => ((justConnected = false), (eggDeferred = true))}>
        Entra senza mostrarla
      </button>
      <button class="btn btn-ribbon" onclick={() => (justConnected = false)}>Mostrala adesso</button>
    </div>
  </div>
{:else if showEgg}
  <EasterEgg nickname={store.data.settings.nickname} onyes={onYes} />
{:else}
  <AppNav />
  {#key route}
    {#if route.name === 'gift'}
      <GiftPage />
    {:else if route.name === 'restaurants'}
      <RestaurantsPage />
    {:else if route.name === 'restaurant'}
      <RestaurantPage id={route.id} />
    {:else if route.name === 'restaurant-edit'}
      <RestaurantEdit id={route.id} />
    {:else if route.name === 'new'}
      <ReviewForm />
    {:else if route.name === 'review'}
      <ReviewForm restaurantId={route.restaurantId} reviewId={route.reviewId} />
    {:else if route.name === 'settings'}
      <SettingsPage />
    {/if}
  {/key}
{/if}

<style>
  .loading {
    min-height: 100dvh;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 12px;
    padding: 24px;
    text-align: center;
    color: var(--color-cocoa-soft);
  }

  .loading p {
    margin: 0;
    max-width: 38ch;
  }

  .ready {
    color: var(--color-cocoa);
    background:
      linear-gradient(var(--color-blush), var(--color-blush)) center / 100% calc(100% - 20px) no-repeat,
      var(--stripes);
  }

  .pair {
    display: flex;
    gap: 4px;
  }

  .ready-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
  }
</style>
