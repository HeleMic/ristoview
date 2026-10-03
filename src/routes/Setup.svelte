<script lang="ts">
  import Dog from '../components/Dog.svelte';
  import { GitHubError } from '../lib/storage/github';
  import { store } from '../lib/store.svelte';
  import type { Role } from '../lib/types';

  interface Props {
    onconnected: () => void;
  }
  let { onconnected }: Props = $props();

  let owner = $state('');
  let repo = $state('ristoview-data');
  let branch = $state('main');
  let path = $state('data.json');
  let token = $state('');
  let role = $state<Role>('lei');
  let busy = $state(false);
  let error = $state('');
  let advanced = $state(false);

  async function connect(e: SubmitEvent) {
    e.preventDefault();
    if (!owner.trim() || !repo.trim() || !token.trim()) {
      error = 'Servono proprietario, repository e token.';
      return;
    }
    busy = true;
    error = '';
    try {
      await store.connect({
        mode: 'github',
        owner: owner.trim(),
        repo: repo.trim(),
        branch: branch.trim() || 'main',
        path: path.trim() || 'data.json',
        token: token.trim(),
        role,
      });
      onconnected();
    } catch (err) {
      error = err instanceof GitHubError || err instanceof Error ? err.message : String(err);
    } finally {
      busy = false;
    }
  }

  async function tryLocal() {
    await store.connect({ mode: 'local', role });
    onconnected();
  }
</script>

<div class="setup">
  <div class="band" aria-hidden="true"></div>
  <main class="card">
    <div class="brand">
      <div class="dogs" aria-hidden="true">
        <Dog breed="norfolk" size={86} look={{ x: 0.6, y: 0.2 }} tilt={-6} />
        <Dog breed="pinscher" size={86} look={{ x: -0.6, y: 0.2 }} tilt={6} />
      </div>
      <h1 class="script logo">ristoview</h1>
      <p class="tag">Colleghiamo questo dispositivo al vostro diario.</p>
    </div>

    <form onsubmit={connect} novalidate>
      <fieldset class="who">
        <legend class="label">Questo dispositivo è di…</legend>
        <div class="seg">
          <label class:on={role === 'lei'}><input type="radio" bind:group={role} value="lei" /> Lei</label>
          <label class:on={role === 'lui'}><input type="radio" bind:group={role} value="lui" /> Lui</label>
        </div>
        <p class="hint">Firma le recensioni. La sorpresa iniziale compare solo sui dispositivi di lei.</p>
      </fieldset>

      <label class="field">
        <span>Proprietario del repo dati</span>
        <input class="input" autocomplete="username" autocapitalize="off" spellcheck="false" placeholder="il tuo username GitHub" bind:value={owner} />
      </label>
      <label class="field">
        <span>Repository</span>
        <input class="input" autocapitalize="off" spellcheck="false" bind:value={repo} />
      </label>
      <label class="field">
        <span>Token GitHub</span>
        <input class="input" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…" bind:value={token} />
        <span class="hint">Resta solo in questo browser. Come generarlo: <code>docs/guida-dati.md</code>.</span>
      </label>

      {#if advanced}
        <div class="two">
          <label class="field"><span>Branch</span><input class="input" autocapitalize="off" bind:value={branch} /></label>
          <label class="field"><span>File</span><input class="input" autocapitalize="off" bind:value={path} /></label>
        </div>
      {:else}
        <button type="button" class="link" onclick={() => (advanced = true)}>Branch e file personalizzati</button>
      {/if}

      <p class="error" role="alert">{error}</p>

      <button class="btn btn-ribbon" type="submit" disabled={busy}>
        {busy ? 'Controllo il token…' : 'Collega'}
      </button>
      <button type="button" class="link center" onclick={tryLocal}>Provalo senza GitHub (i dati restano su questo dispositivo)</button>
    </form>
  </main>
</div>

<style>
  .setup {
    min-height: 100dvh;
    display: grid;
    justify-items: center;
    align-content: start;
    padding-bottom: 40px;
  }

  .band {
    width: 100%;
    height: 120px;
    background: var(--stripes);
  }

  .card {
    position: relative;
    width: min(460px, calc(100% - 32px));
    margin-top: -64px;
    padding: 0 22px 24px;
    border-radius: 18px;
    background: var(--color-paper);
    box-shadow: var(--shadow-lift);
  }

  .brand {
    display: grid;
    justify-items: center;
    text-align: center;
  }

  .dogs {
    display: flex;
    gap: 4px;
    margin-top: -48px;
  }

  .logo {
    font-size: 56px;
    line-height: 1;
    margin-top: 4px;
  }

  .tag {
    margin: 6px 0 18px;
    color: var(--color-cocoa-soft);
  }

  form {
    display: grid;
    gap: 16px;
  }

  .who {
    border: 0;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 8px;
  }

  .who legend {
    padding: 0;
    margin-bottom: 8px;
  }

  .seg {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: var(--color-petal);
  }

  .seg label {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 42px;
    border-radius: 999px;
    font-weight: 700;
    color: var(--color-cocoa-soft);
    cursor: pointer;
  }

  .seg label.on {
    background: var(--color-paper);
    color: var(--color-cocoa);
    box-shadow: var(--shadow-soft);
  }

  .seg label:has(input:focus-visible) {
    outline: 3px solid var(--color-ribbon);
  }

  .seg input {
    position: absolute;
    opacity: 0;
    inset: 0;
    margin: 0;
    cursor: pointer;
  }

  .two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  code {
    font-size: 0.92em;
    padding: 1px 5px;
    border-radius: 5px;
    background: var(--color-blush);
  }

  .link {
    justify-self: start;
    padding: 4px 0;
    border: 0;
    background: none;
    color: var(--color-ribbon);
    font-weight: 650;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .link.center {
    justify-self: center;
    text-align: center;
    font-size: 14px;
    color: var(--color-cocoa-soft);
  }

  .error {
    margin: 0;
    min-height: 1.2em;
    color: var(--color-ribbon-deep);
    font-weight: 650;
  }
</style>
