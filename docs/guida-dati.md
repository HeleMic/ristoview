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

Premi **Entra**: l'app verifica il token, legge `data.json` (o lo crea) e sei operativo.

### Cosa vede chi

- **Lei** vede il regalo del mese: apre il pacchetto, sceglie la cena, può cambiare idea fino al timbro.
- **Lui** vede solo lo stato del regalo (non aperto, cosa ha scelto, sfruttato) e può timbrarlo dopo la cena.
  Dalle Impostazioni imposta il **soprannome** di lei e può **cancellare tutti i dati**.

### Configurare il telefono di lei senza rovinare la sorpresa

La schermata "Vuoi venire a cena con me?" compare **solo sui dispositivi di lei** e **solo finché lei non ha premuto
"Sì"**. Il flag `easterEggSeen` sta in `data.json`, quindi dopo il primo "Sì" non ricompare su nessun dispositivo.

1. Sul tuo dispositivo, in **Impostazioni → Come chiamarla**, imposta il soprannome (salvato in `data.json` →
   `settings.nickname`).
2. Sul telefono di lei apri il sito (meglio: **Condividi → Aggiungi alla schermata Home**), scegli **Lei**, scrivi il
   suo nome e incolla il **suo token**.
3. Dopo l'accesso l'app mostra **"Tutto pronto"**: premi **Entra senza mostrarla** e chiudi. La sorpresa partirà la
   prossima volta che lei apre l'app.

### Ricominciare da zero

**Impostazioni → Ricomincia da zero → Cancella tutti i dati** (solo sul dispositivo di lui) svuota ristoranti,
recensioni, regali, soprannome e flag della sorpresa. In `data.json` resta un campo `resetAt`: anche se l'altro telefono
aveva una copia vecchia in cache, alla prima sincronizzazione la scarta. Lo storico su GitHub resta, quindi un reset
fatto per sbaglio si può sempre annullare ripristinando una versione precedente del file (vedi sotto).

---

## 4. Lavorare con il repo dei dati

### Vedere lo storico

Su GitHub apri `ristoview-data` → `data.json` → **History**. Ogni salvataggio dell'app è un commit con un messaggio
tipo `ristoview: nuova recensione «Da Mario»`.

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

Puoi modificare `data.json` direttamente su GitHub, ma:

- deve restare **JSON valido** (attenzione a virgole e virgolette);
- non cambiare gli `id`: collegano recensioni, ristoranti e regali;
- le date sono stringhe ISO (`"2026-10-03"` o `"2026-10-03T20:30:00.000Z"`); il mese del regalo è `"2026-10"`.

Se l'app trova un file non valido, non lo sovrascrive: mostra un errore e lavora sulla copia locale finché non lo
correggi.

### Backup extra

In **Impostazioni → Esporta JSON** scarichi una copia completa dei dati. **Importa JSON** la ricarica, unendola ai dati
esistenti.

---

## 5. Struttura di `data.json`

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
| **File dati non valido** | `data.json` modificato a mano con un errore | correggilo su GitHub o ripristina una versione precedente |

### Revocare un token

**Settings → Developer settings → Fine-grained tokens** → scegli il token → **Delete**. Il dispositivo che lo usava
smette subito di sincronizzare (i dati locali restano) finché non inserisci un token nuovo.

### Nota sulla sicurezza

Il token è salvato nel `localStorage` del browser per l'origine del sito (`<tuo-username>.github.io`). Tutti i siti
GitHub Pages del tuo account condividono quell'origine, quindi pubblica lì solo codice tuo. Il token può comunque
toccare soltanto `ristoview-data`.
