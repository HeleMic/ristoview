# ristoview

Il nostro diario dei ristoranti, con un regalo al mese.

Sito completamente client-side (Svelte 5 + Vite + TypeScript), installabile come app (PWA) e pubblicato su GitHub Pages.
I dati non stanno qui: vivono in un repository GitHub **privato** separato. Vedi [docs/guida-dati.md](docs/guida-dati.md)
per creare il repo dei dati, generare il token e collegare i dispositivi.

## Sviluppo

Serve [Bun](https://bun.sh).

```bash
bun install
```

```bash
bun run dev
```

Il sito gira su <http://localhost:5173/ristoview/>. Al primo avvio scegli **Provalo senza GitHub** per lavorare con
dati solo locali, oppure collega il repo dei dati.

| Comando | Cosa fa |
|---|---|
| `bun run dev` | server di sviluppo |
| `bun run check` | type-check (svelte-check + tsc) |
| `bun test src` | test unitari (merge dei dati, logica del regalo) |
| `bun run build` | build di produzione in `dist/` |
| `bun run preview` | serve la build di produzione |
| `bun run icons` | rigenera le icone PNG da `assets/icon.svg` e `assets/icon-monochrome.svg` |

## Pubblicazione

A ogni push su `main` la GitHub Action [.github/workflows/deploy.yml](.github/workflows/deploy.yml) esegue test,
type-check e build e pubblica su GitHub Pages. Nel repo va attivato una volta **Settings → Pages → Source: GitHub
Actions**. Il percorso base (`/<nome-repo>/`) viene impostato in automatico dal nome del repository.

## Struttura

```
src/
  App.svelte              shell: collegamento, sorpresa iniziale, routing
  routes/                 schermate (regalo, ristoranti, recensione, impostazioni, sorpresa)
  components/             cani, pacchetto regalo, voti a zampette, icone, navigazione
  lib/
    store.svelte.ts       stato dell'app, cache locale e sincronizzazione con GitHub
    storage/              client GitHub, cache IndexedDB, configurazione del dispositivo
    merge.ts              unione dei dati tra dispositivi (per id, vince il più recente)
    gifts.ts              logica del regalo mensile
    actions.ts            operazioni sui dati
```
