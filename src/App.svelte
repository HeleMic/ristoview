<script lang="ts">
  import { onMount } from 'svelte';
  import AppNav from './components/AppNav.svelte';
  import Dog from './components/Dog.svelte';
  import Lovebird from './components/Lovebird.svelte';
  import { markEasterEggSeen } from './lib/actions';
  import { BIRD_NAME, DOG_NAMES, randomBreed } from './lib/dogs';
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

  const loadingDog = randomBreed();
  const loadingBird = Math.random() < 0.34;

  const eggPending = $derived(store.config?.role === 'lei' && !store.data.settings.easterEggSeen);
  // On her device the surprise starts right after setup, and again on every open until she says yes.
  const showEgg = $derived(eggPending && store.settled);
  // Her first open waits for GitHub, so a stale cache never replays (or skips) the surprise.
  const waiting = $derived(!store.ready || (eggPending && !store.settled));
  const route = $derived(router.route);

  function onYes() {
    markEasterEggSeen();
    ui.justSaidYes = true;
    router.go(paths.gift);
  }

  function onConnected() {
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
    {#if loadingBird}
      <Lovebird size={90} tilt={-12} />
      <p>{BIRD_NAME} sta aprendo la pasticceria…</p>
    {:else}
      <Dog breed={loadingDog} size={120} tilt={-8} />
      <p>{DOG_NAMES[loadingDog]} sta aprendo la pasticceria…</p>
    {/if}
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

</style>
