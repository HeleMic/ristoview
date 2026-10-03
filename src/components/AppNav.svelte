<script lang="ts">
  import { paths, router } from '../lib/router.svelte';
  import { store } from '../lib/store.svelte';
  import Icon, { type IconName } from './Icon.svelte';

  type Section = 'gift' | 'restaurants' | 'new' | 'settings';

  const items: { id: Section; href: string; label: string; icon: IconName }[] = [
    { id: 'gift', href: paths.gift, label: 'Regalo', icon: 'gift' },
    { id: 'restaurants', href: paths.restaurants, label: 'Ristoranti', icon: 'cloche' },
    { id: 'new', href: paths.new, label: 'Nuova cena', icon: 'plus' },
    { id: 'settings', href: paths.settings, label: 'Impostazioni', icon: 'sliders' },
  ];

  const active = $derived.by<Section>(() => {
    const n = router.route.name;
    if (n === 'gift') return 'gift';
    if (n === 'new') return 'new';
    if (n === 'settings') return 'settings';
    return 'restaurants';
  });

  const SYNC: Record<string, { label: string; tone: string; icon: IconName }> = {
    saved: { label: 'Salvato', tone: 'ok', icon: 'cloud' },
    syncing: { label: 'Salvo…', tone: 'busy', icon: 'cloud' },
    offline: { label: 'Offline', tone: 'warn', icon: 'cloud-off' },
    local: { label: 'Solo qui', tone: 'muted', icon: 'cloud-off' },
    error: { label: 'Errore', tone: 'bad', icon: 'cloud-off' },
  };
  const sync = $derived(SYNC[store.status]);
</script>

<header class="topbar">
  <div class="inner">
    <a class="logo script" href={paths.gift} aria-label="ristoview, torna al regalo">ristoview</a>

    <nav class="top-nav" aria-label="Sezioni">
      {#each items as item (item.id)}
        <a href={item.href} aria-current={active === item.id ? 'page' : undefined}>{item.label}</a>
      {/each}
    </nav>

    {#if sync}
      <a class="sync {sync.tone}" href={paths.settings} title={store.error ?? sync.label}>
        <Icon name={sync.icon} size={18} />
        <span>{sync.label}</span>
      </a>
    {/if}
  </div>
  <div class="ribbon-band" aria-hidden="true"></div>
</header>

<nav class="tabbar" aria-label="Sezioni">
  {#each items as item (item.id)}
    <a
      href={item.href}
      class:main={item.id === 'new'}
      aria-current={active === item.id ? 'page' : undefined}
    >
      <span class="ico"><Icon name={item.icon} size={item.id === 'new' ? 24 : 22} /></span>
      <span class="lbl">{item.label}</span>
    </a>
  {/each}
</nav>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--color-paper);
    padding-top: env(safe-area-inset-top);
  }

  .inner {
    display: flex;
    align-items: center;
    gap: 20px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 6px var(--gutter);
    min-height: 54px;
  }

  .ribbon-band {
    height: 10px;
    background: var(--stripes);
    box-shadow: 0 4px 10px -6px rgb(143 23 69 / 0.35);
  }

  .logo {
    font-size: 34px;
    line-height: 1;
    color: var(--color-cocoa);
    text-decoration: none;
    padding-top: 4px;
  }

  .top-nav {
    display: none;
    gap: 4px;
    margin-left: auto;
  }

  .top-nav a {
    padding: 8px 14px;
    border-radius: 999px;
    color: var(--color-cocoa-soft);
    font-weight: 650;
    text-decoration: none;
    transition: background-color 140ms;
  }

  .top-nav a:hover {
    background: var(--color-blush);
    color: var(--color-cocoa);
  }

  .top-nav a[aria-current='page'] {
    background: var(--color-petal);
    color: var(--color-cocoa);
  }

  .sync {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 650;
    text-decoration: none;
    color: var(--color-cocoa-soft);
  }

  .sync.ok {
    color: #3f6b45;
  }

  .sync.busy :global(svg) {
    animation: breathe 1.2s ease-in-out infinite;
  }

  .sync.warn {
    color: var(--color-gold-deep);
  }

  .sync.bad {
    background: var(--color-ribbon);
    color: #fff;
  }

  @media (min-width: 900px) {
    .top-nav {
      display: flex;
    }

    .sync {
      margin-left: 8px;
    }
  }

  /* ---------- Bottom tab bar (phones) ---------- */

  .tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 6px 6px calc(6px + env(safe-area-inset-bottom));
    background: rgb(255 250 251 / 0.94);
    backdrop-filter: blur(10px);
    box-shadow: 0 -1px 0 var(--color-line), 0 -8px 24px -12px rgb(143 23 69 / 0.25);
  }

  @media (min-width: 900px) {
    .tabbar {
      display: none;
    }
  }

  .tabbar a {
    display: grid;
    justify-items: center;
    gap: 2px;
    padding: 6px 2px;
    border-radius: 14px;
    color: var(--color-cocoa-mute);
    font-size: 12px;
    font-weight: 650;
    text-decoration: none;
  }

  .tabbar a[aria-current='page'] {
    color: var(--color-ribbon);
  }

  .ico {
    display: grid;
    place-items: center;
    width: 44px;
    height: 30px;
    border-radius: 999px;
    transition: background-color 160ms;
  }

  .tabbar a[aria-current='page'] .ico {
    background: var(--color-petal);
  }

  .tabbar a.main .ico {
    background: var(--color-cocoa);
    color: var(--color-paper);
  }

  .tabbar a.main[aria-current='page'] .ico {
    background: var(--color-ribbon);
  }

  @keyframes breathe {
    50% {
      opacity: 0.35;
    }
  }
</style>
