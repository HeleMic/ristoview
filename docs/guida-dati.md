# Guida: repo dei dati e token GitHub

ristoview non ha un server. Tutti i dati (ristoranti, recensioni, regali, impostazioni) stanno in **un solo file JSON**
dentro un **repository GitHub privato**. Il sito, che gira interamente nel browser, legge e scrive quel file tramite le
API di GitHub usando un **token personale** salvato solo sul dispositivo.

```
┌──────────────────────────┐        HTTPS + token         ┌──────────────────────────────┐
│ ristoview (sito, pubblico)│  ─────────────────────────▶  │ ristoview-data (privato)      │
│ GitHub Pages              │  ◀─────────────────────────  │ └── data.json                 │
└──────────────────────────┘     GitHub Contents API      └──────────────────────────────┘
            │
            └── cache locale (IndexedDB): l'app funziona anche offline e sincronizza appena può
```

Ogni salvataggio è un **commit**: hai lo storico completo di ogni modifica, gratis.

Il file è **cifrato** con una chiave che scegliete voi (vedi [sezione 3](#3-collega-lapp)): anche chi riuscisse a
leggere il repo vedrebbe solo dati illeggibili. La chiave non viene mai inviata a GitHub né salvata nel codice.

---

## 1. Crea il repo dei dati

1. Vai su <https://github.com/new>.
2. **Repository name**: `ristoview-data` (puoi sceglierne un altro, lo inserirai nelle impostazioni dell'app).
3. Visibilità: **Private**. È importante: qui dentro ci sono le vostre recensioni e il soprannome di lei.
4. Spunta **Add a README file**: serve solo a creare il branch `main`.
5. **Create repository**.

Non serve creare `data.json`: se manca, l'app lo crea da sola al primo salvataggio.

> Il repo del **sito** (`ristoview`) può invece essere pubblico: non contiene né dati né token.

---

## 2. Genera un token fine-grained

I token *fine-grained* permettono di dare accesso **a un solo repository** e **a un solo permesso**. Se un token
finisce nelle mani sbagliate, può toccare soltanto `data.json`.

1. Vai su **GitHub → foto profilo → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
   (link diretto: <https://github.com/settings/personal-access-tokens/new>).
2. Compila:
   | Campo | Valore |
   |---|---|
   | **Token name** | `ristoview – telefono di lei` (uno per dispositivo/persona, vedi sotto) |
   | **Expiration** | la scadenza più lunga che GitHub ti propone; segnati la data in calendario |
   | **Resource owner** | il tuo account |
   | **Repository access** | **Only select repositories** → `ristoview-data` |
3. In **Permissions → Repository permissions** imposta:
   - **Contents** → **Read and write**
   - (**Metadata → Read-only** viene aggiunto in automatico, va bene così)
   - Tutto il resto lascialo su *No access*.
4. **Generate token** e **copialo subito**: GitHub lo mostra una volta sola. Inizia con `github_pat_…`.

### Un token per persona

Genera **due token**: uno per te e uno per lei, entrambi dal tuo account (lei non ha bisogno di un account GitHub).
Così, se lei perde il telefono, revochi solo il suo senza toccare il tuo.

### Dove NON mettere il token

- Mai nel codice del sito, in un commit, in un file `.env` committato o in un URL.
- Mai in chat o email. Se ti serve passarlo da un dispositivo all'altro, usa il gestore password.

---

## 3. Collega l'app

Il repo dei dati è fisso nel codice (`HeleMic/ristoview-data`, branch `main`, file `data.json`: vedi
`DATA_REPO` in `src/lib/storage/config.ts`). Al primo avvio, su un dispositivo non collegato, l'app chiede solo tre
cose:

| Campo | Note |
|---|---|
| Questo dispositivo è di… | **Lui** o **Lei**. Non si cambia più: per cambiarlo bisogna scollegare il dispositivo e rifare l'accesso |
| Il tuo nome | firma le recensioni scritte da questo dispositivo |
| Token | `github_pat_…`, resta solo in questo browser (`localStorage`) |
| Chiave | frase segreta di almeno 8 caratteri, **uguale su tutti e due i telefoni**; resta solo in questo browser |

Premi **Entra**: l'app verifica il token, prova a decifrare `data.json` con la chiave (o lo crea, se non c'è ancora) e
sei operativo. Con una chiave diversa da quella usata dall'altro telefono l'accesso viene rifiutato con
"Chiave sbagliata", prima di scrivere qualsiasi cosa.

### La chiave

- Sceglietela **una volta** e usate la stessa su entrambi i telefoni. Una frase di 4-5 parole è più forte e più facile
  da ricordare di una password corta.
- Conservatela nel gestore password: **se la perdete, i dati sul repo non si possono più leggere**. Nessuno, nemmeno
  GitHub, può recuperarla. (I dati restano leggibili sui telefoni già collegati, che ne hanno una copia locale: da lì
  potete fare **Esporta JSON**.)
- Come funziona: dalla chiave si ricava una chiave AES-256 con PBKDF2-SHA256 (600.000 iterazioni, salt casuale salvato
  nel file); il contenuto è cifrato con AES-GCM, che rileva anche qualsiasi modifica al file.
- Cosa resta visibile a chi legge il repo: solo che il file esiste, la sua dimensione e le date dei commit. I messaggi
  dei commit sono generici (`ristoview: aggiornamento`) e non contengono nomi di ristoranti.
- Il backup **Esporta JSON** e la cache locale del telefono sono **in chiaro**: il backup custoditelo voi.

### Cosa vede chi

- **Lei** vede il regalo del mese: apre il pacchetto, sceglie la cena, può cambiare idea fino al timbro.
- **Lui** vede solo lo stato del regalo (non aperto, cosa ha scelto, sfruttato) e può timbrarlo dopo la cena.
  Dalle Impostazioni imposta il **soprannome** di lei e può **cancellare tutti i dati**.

### La sorpresa sul telefono di lei

La schermata "Vuoi venire a cena con me?" compare **solo sui dispositivi di lei**, **subito dopo il primo accesso**, e
ricompare a ogni apertura **finché lei non preme "Sì"**. Il flag `easterEggSeen` sta in `data.json`, quindi dopo il
primo "Sì" non ricompare su nessun dispositivo.

1. Sul tuo dispositivo, in **Impostazioni → Come chiamarla**, imposta il soprannome (salvato in `data.json` →
   `settings.nickname`): la sorpresa lo usa.
2. Mandale il link del sito, il suo token e (a parte) la chiave. Lei aggiunge il sito alla Home, sceglie **Lei**,
   scrive nome, token e chiave e preme **Entra**: la sorpresa parte lì.

Se il primo accesso sul suo telefono lo fai tu, alla schermata della sorpresa chiudi l'app senza toccare nulla:
finché nessuno preme "Sì" la sorpresa resta intatta.

### Ricominciare da zero

**Impostazioni → Ricomincia da zero → Cancella tutti i dati** (solo sul dispositivo di lui) svuota ristoranti,
recensioni, regali, soprannome e flag della sorpresa, poi scollega il dispositivo: token, ruolo, nome e cache locale
vengono cancellati e si torna alla schermata di primo accesso. Se GitHub non risponde il dispositivo resta collegato
(la cancellazione partirà appena torna la connessione) e l'app lo segnala. In `data.json` resta un campo `resetAt`: anche se l'altro telefono
aveva una copia vecchia in cache, alla prima sincronizzazione la scarta. Lo storico su GitHub resta, quindi un reset
fatto per sbaglio si può sempre annullare ripristinando una versione precedente del file (vedi sotto).

---

## 4. Lavorare con il repo dei dati

### Vedere lo storico

Su GitHub apri `ristoview-data` → `data.json` → **History**. Ogni salvataggio dell'app è un commit con un messaggio
generico (`ristoview: aggiornamento`): il contenuto è cifrato, quindi le differenze tra versioni non sono leggibili.

### Ripristinare una versione precedente

Dal browser:

1. **History** → apri il commit buono → **View file** → **Raw**.
2. Copia tutto il contenuto.
3. Torna su `data.json` → icona matita → incolla → **Commit changes**.

Da terminale:

```bash
git clone git@github.com:<tuo-username>/ristoview-data.git
```

```bash
git -C ristoview-data log --oneline -- data.json
```

```bash
git -C ristoview-data checkout <hash-del-commit> -- data.json && git -C ristoview-data commit -m "ripristino" && git -C ristoview-data push
```

L'app si accorge della nuova versione al successivo avvio o premendo **Sincronizza**.

### Modificare i dati a mano

Il file su GitHub è cifrato, quindi non si modifica più dal sito di GitHub. Per correggere qualcosa a mano:

1. dall'app **Impostazioni → Esporta JSON** (in chiaro);
2. modifica il file restando in **JSON valido**, senza cambiare gli `id` (collegano recensioni, ristoranti e regali);
3. **Importa JSON**: i dati vengono uniti a quelli esistenti e salvati di nuovo cifrati.

Se l'app trova su GitHub un file non valido o con una chiave diversa, non lo sovrascrive: mostra un errore e lavora
sulla copia locale.

### Backup extra

In **Impostazioni → Esporta JSON** scarichi una copia completa dei dati. **Importa JSON** la ricarica, unendola ai dati
esistenti.

---

## 5. Struttura di `data.json`

Su GitHub il file contiene solo la "busta" cifrata:

```jsonc
{
  "ristoview": "encrypted",
  "v": 1,
  "kdf": { "name": "PBKDF2", "hash": "SHA-256", "iterations": 600000, "salt": "…" },
  "cipher": "AES-GCM",
  "iv": "…",
  "data": "…"                       // il JSON qui sotto, cifrato
}
```

Una volta decifrato (e nel backup **Esporta JSON**) il contenuto è:

```jsonc
{
  "version": 1,
  "updatedAt": "2026-10-03T19:30:00.000Z",
  "settings": {
    "nickname": "Topolina",          // come il sito si rivolge a lei
    "easterEggSeen": false
  },
  "gifts": [
    {
      "id": "g_…",
      "month": "2026-10",            // un regalo per mese di calendario
      "category": "sushi",
      "chosenAt": "…",
      "redeemedAt": null,            // valorizzato = "sfruttato"; da lì la scelta è bloccata
      "restaurantId": null           // opzionale: dove siete andati
    }
  ],
  "restaurants": [
    { "id": "r_…", "number": 1, "name": "Da Mario", "cuisine": "Pizza",
      "mapsUrl": "…", "wishlist": false, "createdAt": "…", "updatedAt": "…" }
  ],
  "reviews": [
    { "id": "v_…", "restaurantId": "r_…", "date": "2026-10-03", "author": "lei", "authorName": "…",
      "dishes": "…", "ratings": { "food": 5, "service": 4, "welcome": 5, "ambience": 4, "value": 4 },
      "waiters": "…", "welcomeNotes": "…", "bill": 64.5, "people": 2, "notes": "…",
      "wouldReturn": true, "createdAt": "…", "updatedAt": "…" }
  ],
  "deleted": ["r_…"],               // id eliminati, per non farli "resuscitare" durante le sincronizzazioni
  "resetAt": "…"                    // solo dopo "Cancella tutti i dati"
}
```

Un regalo il cui `month` è passato e che non ha `redeemedAt` è **scaduto**. Lo stato non viene salvato: l'app lo
calcola.

---

## 6. Sincronizzazione e conflitti

- Ogni modifica viene salvata prima in locale (IndexedDB) e poi inviata a GitHub.
- GitHub accetta la scrittura solo se il file non è cambiato da quando l'app l'ha letto (controllo sullo `sha`).
- Se nel frattempo l'altro dispositivo ha salvato, l'app riscarica il file, **unisce le modifiche per `id`** (vince la
  versione con `updatedAt` più recente) e riprova. Non perdete nulla anche scrivendo in contemporanea.
- Offline l'app funziona normalmente. Le modifiche partono appena torna la connessione e un indicatore in alto mostra
  lo stato.

---

## 7. Problemi comuni

| Messaggio / sintomo | Causa probabile | Soluzione |
|---|---|---|
| **Token non valido o scaduto** (401) | token scaduto, revocato o copiato male | genera un nuovo token e reinseriscilo in Impostazioni |
| **Repository non trovato** (404) | il token non include `ristoview-data`, o è stato generato da un altro account | nel token verifica *Only select repositories* → `ristoview-data` |
| **Permesso negato** (403) | il token ha *Contents: Read-only* | modifica il token → *Contents: Read and write* |
| **Troppe richieste** (403/429) | limite API (5.000/ora: praticamente impossibile da raggiungere) | aspetta qualche minuto |
| **File dati non valido** | `data.json` modificato a mano con un errore | ripristina una versione precedente |
| **Chiave sbagliata** | chiave diversa da quella usata dall'altro telefono (attenzione a maiuscole e spazi) | inserisci la stessa chiave dell'altro telefono |

### Revocare un token

**Settings → Developer settings → Fine-grained tokens** → scegli il token → **Delete**. Il dispositivo che lo usava
smette subito di sincronizzare (i dati locali restano) finché non inserisci un token nuovo.

### Nota sulla sicurezza

Il token è salvato nel `localStorage` del browser per l'origine del sito (`<tuo-username>.github.io`). Tutti i siti
GitHub Pages del tuo account condividono quell'origine, quindi pubblica lì solo codice tuo. Il token può comunque
toccare soltanto `ristoview-data`.
