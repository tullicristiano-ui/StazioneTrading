# 01 — Come funziona l'app (versione beta attuale)

> Spiegazione di cosa fa l'app oggi. Prima in parole semplici (cosa vedi tu),
> poi la parte tecnica per gli agenti che svilupperanno la nuova versione.

---

## PARTE A — In parole semplici (cosa vedi tu usando l'app)

L'app è un **banco di lavoro personale per il trading** che gira **solo sul tuo computer**. Si apre nel browser. Nessun dato esce dal PC.

### Le pagine principali (cosa succede in ognuna)

1. **Home** (la prima schermata)
   - Sfondo scuro con un'animazione di puntini verdi che si muovono, più un'immagine di sfondo.
   - In alto a destra: **orologio in tempo reale** e tre pallini che dicono se le borse di Londra / New York / Tokyo sono aperte o chiuse.
   - Titolo grande "FREEDOM TRADING SYSTEM" e quattro pulsanti: *Nuova Analisi*, *Le mie Analisi*, *Journal*, *Trading Live*.
   - Sotto: una vetrina con i vantaggi dell'app, un calendarietto del mese e nove mini-grafici di asset (Bitcoin, Oro, EUR/USD, ecc.).
   - Se hai una sessione di lavoro ancora aperta, compare un avviso "Sessione in corso — Riapri".

2. **Nuova Analisi → Workspace** (il cuore dell'app)
   - Clicchi *Nuova Analisi*, dai (se vuoi) un nome all'asset, e si apre una **scheda di lavoro** (Workspace).
   - Qui c'è una **chat con l'agente AI**: scrivi un messaggio e/o **carichi lo screenshot di un grafico** (anche con copia-incolla Ctrl+V).
   - L'agente risponde nella chat applicando un metodo di lettura del mercato. Tutto viene **salvato**, così lo ritrovi anche domani.
   - A lato c'è la **"memoria della sessione"**: un riquadro che riassume asset, timeframe, struttura e livelli emersi dall'analisi.
   - Puoi: chiudere la sessione (l'AI ne fa un **riassunto**), salvare uno **snapshot** (una foto del momento), attivare una **modalità a tutto schermo** per concentrarti.

3. **Le mie Analisi** (archivio sessioni)
   - La lista di tutte le sessioni, con data di apertura e ultima modifica, etichette colorate (tag), pulsanti per **rinominare** o **cancellare**, e il link alla Timeline.

4. **Timeline**
   - Tutti i messaggi e gli screenshot di una sessione in ordine di tempo, con possibilità di **salvarli in PDF**.

5. **Journal** (diario dei trade)
   - Una tabella con le operazioni. L'agente può **generare una riga** del diario; tu puoi modificarla, cancellarla ed **esportare tutto in CSV** (un file apribile con Excel).

6. **Trading Live** (cruscotto mercati)
   - Grafici professionali (TradingView): grafico avanzato, panoramica, heatmap, **calendario economico** e **news in italiano**.

7. **Note** e **Cerca** — un blocco note con autosalvataggio e una ricerca rapida tra le sessioni.

8. **Tema** — un interruttore per cambiare colore (verde / scuro).

### ⚠️ Il limite importante di oggi

La cosa più importante che l'app dovrebbe fare — **far "vedere" il grafico all'AI** — **oggi non funziona davvero**. Il modello AI attualmente collegato (si chiama Gemma) **legge solo il testo, non le immagini**. Quindi quando carichi uno screenshot, lui non lo vede: riceve solo una nota scritta che dice "c'è un'immagine allegata". L'analisi vera del grafico **manca**. (C'è un tentativo opzionale di farglielo leggere con un programma locale chiamato Ollama, ma è un ripiego lento e complicato.)

👉 **Nella nuova versione questo è il punto numero 1 da risolvere**: collegare un'AI che vede le immagini (es. un modello Claude/Sonnet).

---

## PARTE B — Come è fatta dentro (parte tecnica)

### Architettura a tre pezzi

```
   IL BROWSER (quello che vedi)                IL MOTORE (server)                 LA MEMORIA
   ─────────────────────────────              ──────────────────────             ────────────
   React + Vite + Tailwind          ──HTTP──►  Node.js + Express      ──────►     SQLite (1 file sul PC)
   (pagine, chat, grafici)                     (API + logica AI)                  + cartella /uploads
                                                      │                            (gli screenshot)
                                                      ▼
                                               Agente AI (kit + provider)
```

- **Client** (`client/`): React + Vite, stile con Tailwind, stato con Zustand, navigazione con react-router. Parla col motore solo via API (non tocca mai il database direttamente).
- **Server** (`server/`): Node.js + Express. Espone le API, salva su database, e orchestra l'AI.
- **Database**: SQLite, cioè **un singolo file** (`server/data/aware_trading.db`). Niente server di database da installare.
- **kit/**: i file che definiscono **come ragiona e risponde l'agente** (il "carattere" dell'AI). Per cambiare il comportamento si toccano questi file, **non** il codice.

### Le tabelle del database (cosa viene salvato)

- **sessions** — le sessioni di analisi (id, date, asset, stato attivo/chiuso, titolo, riassunto, tag).
- **messages** — ogni messaggio della chat (chi l'ha scritto, testo, elenco screenshot).
- **session_memory** — il riassunto strutturato di una sessione (asset, timeframe, struttura, livelli, note).
- **journal_entries** — le righe del diario dei trade (tutti i campi del CSV).
- **snapshots** — le "foto" salvate di una sessione.

> Lo schema si gestisce con un **sistema di migrazioni**: ogni modifica al database è un file `.sql` numerato (`001_…`, `002_…`) che viene applicato una sola volta all'avvio. È un meccanismo solido e va tenuto.

### Come ragiona l'agente AI (il flusso di una risposta)

1. **Skill Loader** legge tutti i file della cartella `kit/` e li unisce nelle "istruzioni di sistema" dell'AI.
2. **Prompt Builder** mette insieme: istruzioni + cronologia della chat + nuovo messaggio + screenshot (convertiti in un formato leggibile dall'AI).
3. **Provider Client** è uno "smistatore": guarda la variabile `AI_PROVIDER` nel file di configurazione `.env` e manda la richiesta al provider giusto (HuggingFace/Gemma oppure OpenRouter). **Cambiare provider non richiede toccare il codice**, solo la configurazione.
4. **Orchestrator** coordina tutto, salva la risposta nel database e aggiorna la "memoria della sessione".

### Configurazione (file `.env`)

Le chiavi e le impostazioni stanno in un file `.env` (mai nel codice). Si sceglie il provider AI, il modello, le porte, i percorsi del database e degli upload. C'è un `.env.example` come modello.

### Punti tecnici di forza (da tenere)

- Sistema di **migrazioni** del database pulito e automatico.
- **Smistatore di provider AI** ben progettato (aggiungere un nuovo provider = creare un file e registrarlo).
- API REST coerenti, tutte con gestione errori (try/catch + risposta JSON `{error}`).
- Componenti grafici riutilizzabili (sfondo animato, widget TradingView, sidebar, tema).

### Punti deboli / incompleti (da rivedere nella nuova versione)

- ❌ **L'AI non vede le immagini** col provider attuale (Gemma text-only) → è il limite centrale.
- ⚠️ Il modulo "Vision locale" con Ollama è un ripiego lento (modello da 3B su CPU, 30–90 secondi) e aggiunge complessità.
- ⚠️ Codice **duplicato**: i widget dei mercati sono copiati quasi identici in due pagine (`Markets.jsx` e `TradingLive.jsx`).
- ⚠️ Nel motore il nome del modello è "scritto a mano" in un punto (`anthropic/claude-3.5-sonnet`) anche quando il provider è un altro: va reso pulito.
- ⚠️ Resti da pulire: un database "orfano" duplicato, un modello inesistente scritto nella configurazione locale, vecchi riferimenti al nome di un metodo da non citare.

---

## Check-list di questo documento

- [x] Spiegato cosa fa l'app dal punto di vista dell'utente (le pagine)
- [x] Spiegata l'architettura tecnica (client / server / database / kit / AI)
- [x] Evidenziato il limite centrale (AI che non legge le immagini)
- [x] Elencati punti di forza e debolezze
- [ ] Prossimo: vedi `02_CODICE-RIUTILIZZABILE.md` per sapere cosa copiare
