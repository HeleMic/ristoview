<script lang="ts">
  import Dog from '../components/Dog.svelte';
  import Lovebird from '../components/Lovebird.svelte';
  import { DATA_REPO } from '../lib/storage/config';
  import { GitHubError } from '../lib/storage/github';
  import { store } from '../lib/store.svelte';
  import type { Role } from '../lib/types';

  interface Props {
    onconnected: () => void;
  }
  let { onconnected }: Props = $props();

  let name = $state('');
  let token = $state('');
  let key = $state('');
  let role = $state<Role>('lei');
  let busy = $state(false);
  let error = $state('');

  async function connect(e: SubmitEvent) {
    e.preventDefault();
    if (!name.trim() || !token.trim() || !key) {
      error = 'Servono nome, token e chiave.';
      return;
    }
    if (key.length < 8) {
      error = 'La chiave deve avere almeno 8 caratteri.';
      return;
    }
    busy = true;
    error = '';
    try {
      await store.connect({ mode: 'github', ...DATA_REPO, token: token.trim(), key, role, name: name.trim() });
      onconnected();
    } catch (err) {
      error = err instanceof GitHubError || err instanceof Error ? err.message : String(err);
    } finally {
      busy = false;
    }
  }

  async function tryLocal() {
    await store.connect({ mode: 'local', role, name: name.trim() || undefined });
    onconnected();
  }
</script>

<div class="setup">
  <div class="band" aria-hidden="true"></div>
  <main class="card">
    <div class="brand">
      <div class="dogs" aria-hidden="true">
        <Dog breed="norfolk" size={86} look={{ x: 0.6, y: 0.2 }} tilt={-6} />
        <div class="bird"><Lovebird size={52} /></div>
        <Dog breed="pinscher" size={86} look={{ x: -0.6, y: 0.2 }} tilt={6} />
      </div>
      <h1 class="script logo">ristoview</h1>
      <p class="tag">Ciao! Tre cose e siamo pronti.</p>
    </div>

    <form onsubmit={connect} novalidate>
      <fieldset class="who">
        <legend class="label">Questo dispositivo è di…</legend>
        <div class="seg">
          <label class:on={role === 'lei'}><input type="radio" bind:group={role} value="lei" /> Lei</label>
          <label class:on={role === 'lui'}><input type="radio" bind:group={role} value="lui" /> Lui</label>
        </div>
        <p class="hint">Firma le recensioni.</p>
      </fieldset>

      <label class="field">
        <span>Il tuo nome</span>
        <input class="input" autocomplete="given-name" placeholder="Come firmi le recensioni" bind:value={name} />
      </label>
      <label class="field">
        <span>Token</span>
        <input class="input" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…" bind:value={token} />
      </label>
      <label class="field">
        <span>Chiave</span>
        <input class="input" type="password" autocomplete="new-password" spellcheck="false" placeholder="Almeno 8 caratteri" bind:value={key} />
        <span class="hint">Uguale su tutti e due i telefoni. Cifra i dati e non lascia mai questo dispositivo.</span>
      </label>

      <p class="error" role="alert">{error}</p>

      <button class="btn btn-ribbon" type="submit" disabled={busy}>
        {busy ? 'Controllo token e chiave…' : 'Entra'}
      </button>
      {#if import.meta.env.DEV}
        <button type="button" class="link center" onclick={tryLocal}>Prova in locale (solo sviluppo)</button>
      {/if}
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
    align-items: flex-end;
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
