<script lang="ts">
  import ConfirmButton from '../components/ConfirmButton.svelte';
  import Dog from '../components/Dog.svelte';
  import Lovebird from '../components/Lovebird.svelte';
  import Icon from '../components/Icon.svelte';
  import { setNickname } from '../lib/actions';
  import { paths, router } from '../lib/router.svelte';
  import { store } from '../lib/store.svelte';

  let nickname = $state(store.data.settings.nickname ?? '');
  let nickSaved = $state(false);
  let importMsg = $state('');
  let fileInput: HTMLInputElement | undefined = $state();

  const gh = $derived(store.github);
  const STATUS: Record<string, string> = {
    idle: 'In attesa',
    syncing: 'Sto salvando su GitHub…',
    saved: 'Tutto salvato su GitHub',
    offline: 'Offline: salvo appena torna la connessione',
    local: 'I dati restano solo su questo dispositivo',
    error: 'Qualcosa non va',
  };

  function saveNick(e: SubmitEvent) {
    e.preventDefault();
    setNickname(nickname);
    nickSaved = true;
    setTimeout(() => (nickSaved = false), 2200);
  }

  function exportJson() {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ristoview-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importJson(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      store.importData(JSON.parse(await file.text()));
      importMsg = `Importato «${file.name}»: i dati sono stati uniti a quelli esistenti.`;
    } catch (err) {
      importMsg = `Non riesco a leggere il file: ${(err as Error).message}`;
    } finally {
      if (fileInput) fileInput.value = '';
    }
  }

  const isLui = $derived(store.config?.role === 'lui');
  let resetDone = $state(false);

  function resetAll() {
    store.resetAll();
    nickname = '';
    resetDone = true;
  }

  async function disconnect() {
    await store.disconnect();
    router.go(paths.gift, true);
  }
</script>

<main class="page">
  <h1 class="page-title">Impostazioni</h1>

  <div class="sheet lace-top">
  <section aria-labelledby="s-device">
    <h2 id="s-device" class="section-title">Questo dispositivo</h2>
    <p class="device">
      È di <strong>{store.config?.name || (isLui ? 'lui' : 'lei')}</strong>{store.config?.name
        ? ` (${store.config.role})`
        : ''}.
    </p>
  </section>

  {#if isLui}
  <section aria-labelledby="s-nick">
    <h2 id="s-nick" class="section-title">Come chiamarla</h2>
    <form class="inline" onsubmit={saveNick}>
      <label class="field grow">
        <span>Soprannome</span>
        <input class="input" placeholder="Es. Topolina" bind:value={nickname} />
      </label>
      <button class="btn btn-primary" type="submit">{nickSaved ? 'Salvato' : 'Salva'}</button>
    </form>
    <p class="hint">Compare nel regalo e nella sorpresa. È salvato nel repo dati, non nel codice.</p>
  </section>
  {/if}

  <section aria-labelledby="s-sync">
    <h2 id="s-sync" class="section-title">Salvataggio</h2>
    <p class="status {store.status}">
      <Icon name={store.status === 'saved' || store.status === 'syncing' ? 'cloud' : 'cloud-off'} size={20} />
      {STATUS[store.status]}
    </p>
    {#if store.error}<p class="error" role="alert">{store.error}</p>{/if}
    {#if gh}
      <dl class="repo">
        <div><dt>Repository</dt><dd>{gh.owner}/{gh.repo}</dd></div>
        <div><dt>File</dt><dd>{gh.path} su {gh.branch}</dd></div>
      </dl>
      <div class="row">
        <button class="btn btn-ghost btn-sm" onclick={() => store.pull()}><Icon name="refresh" size={16} /> Sincronizza ora</button>
      </div>
    {:else if store.config?.role === 'lei'}
      <p class="hint">Per vedere le stesse cene anche sul telefono di lui, chiedigli di collegare questo dispositivo.</p>
    {:else}
      <p class="hint">Per condividere i dati tra i vostri telefoni, scollega e collega il repo GitHub (vedi <code>docs/guida-dati.md</code>).</p>
    {/if}
    <div class="row">
      <ConfirmButton
        label="Scollega questo dispositivo"
        question={gh ? 'Scollegare? I dati restano su GitHub.' : 'Scollegare? I dati di questo dispositivo andranno persi.'}
        confirmLabel="Scollega"
        onconfirm={disconnect}
      />
    </div>
  </section>

  <section aria-labelledby="s-backup">
    <h2 id="s-backup" class="section-title">Backup</h2>
    <p class="hint">Una copia completa di ristoranti, recensioni e regali in un file JSON.</p>
    <div class="row">
      <button class="btn btn-ghost btn-sm" onclick={exportJson}><Icon name="download" size={16} /> Esporta JSON</button>
      <label class="btn btn-ghost btn-sm file">
        <Icon name="upload" size={16} /> Importa JSON
        <input bind:this={fileInput} type="file" accept="application/json,.json" onchange={importJson} />
      </label>
    </div>
    {#if importMsg}<p class="hint" role="status">{importMsg}</p>{/if}
  </section>

  {#if isLui}
    <section aria-labelledby="s-reset">
      <h2 id="s-reset" class="section-title">Ricomincia da zero</h2>
      <p class="hint">
        Cancella ristoranti, recensioni, regali, soprannome e sorpresa su tutti e due i telefoni. Non si torna
        indietro: prima fai un backup.
      </p>
      <div class="row">
        {#if resetDone}
          <p class="hint" role="status">Fatto: il diario è di nuovo vuoto.</p>
        {:else}
          <ConfirmButton
            label="Cancella tutti i dati"
            question="Cancellare tutto, per sempre?"
            confirmLabel="Sì, cancella tutto"
            onconfirm={resetAll}
          />
        {/if}
      </div>
    </section>
  {/if}

  </div>

  <footer class="credits">
    <div class="pair" aria-hidden="true">
      <Dog breed="norfolk" size={64} />
      <div class="bird"><Lovebird size={44} /></div>
      <Dog breed="pinscher" size={64} />
    </div>
    <p>Con Lilla, Pachino e Momo</p>
  </footer>
</main>

<style>
  .page {
    display: grid;
    gap: 14px;
    align-content: start;
  }

  .page-title {
    margin-bottom: 6px;
  }

  .sheet {
    margin-top: 12px;
  }

  .sheet .hint {
    margin: 0;
  }

  .inline {
    display: flex;
    align-items: flex-end;
    gap: 10px;
  }

  .grow {
    flex: 1;
  }

  .device {
    margin: 0;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-weight: 650;
  }

  .status.saved {
    color: #3f6b45;
  }

  .status.error {
    color: var(--color-ribbon-deep);
  }

  .error {
    margin: 0;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--color-petal);
    color: var(--color-ribbon-deep);
    font-weight: 600;
  }

  .repo {
    display: grid;
    gap: 4px;
    margin: 0;
  }

  .repo div {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .repo dt {
    color: var(--color-cocoa-soft);
    min-width: 92px;
  }

  .repo dd {
    margin: 0;
    font-weight: 650;
    overflow-wrap: anywhere;
  }

  .row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .file {
    position: relative;
    overflow: hidden;
  }

  .file input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .file:has(input:focus-visible) {
    outline: 3px solid var(--color-ribbon);
    outline-offset: 2px;
  }

  code {
    font-size: 0.92em;
    padding: 1px 5px;
    border-radius: 5px;
    background: var(--color-blush);
  }

  .credits {
    display: grid;
    justify-items: center;
    gap: 2px;
    margin-top: 18px;
  }

  .credits .pair {
    display: flex;
    align-items: flex-end;
    gap: 4px;
  }

  .credits .bird {
    margin-bottom: 2px;
  }

  .credits p {
    margin: 0;
    font-family: var(--font-script);
    font-size: 24px;
    color: var(--color-cocoa-soft);
  }
</style>
