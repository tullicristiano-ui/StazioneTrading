# 02 — Codice riutilizzabile (cosa copiare nella nuova app)

> Inventario file per file. Ho valutato **solo come "da tenere" ciò che è davvero
> solido e funzionante**. Il resto è marcato da adattare, riscrivere o scartare.
>
> Legenda verdetti:
> - ✅ **DA TENERE** — copialo (quasi) così com'è, è ben fatto
> - 🔧 **DA ADATTARE** — buona base, ma vanno fatte modifiche
> - ✏️ **DA RISCRIVERE** — l'idea è buona, il codice va rifatto
> - ❌ **DA NON RIUSARE** — scartare nella nuova versione

---

## 1. Riepilogo veloce (la "spesa" da portare nella repo nuova)

**Le gemme da copiare subito (✅):**
- Tutta l'**ossatura del server**: database + migrazioni, smistatore provider AI, skill loader, route API.
- I **mattoni grafici riusabili**: sfondo animato, widget TradingView, sidebar, tema, config Tailwind, client API.
- L'intera cartella **`kit/`** (il comportamento dell'agente), ripulita dai nomi da non citare.

**Da NON ricopiare (❌):** il modulo Vision locale (Ollama), il provider Gemma/HuggingFace come motore principale, gli script di test, i file orfani/duplicati.

---

## 2. CLIENT (la parte grafica) — `client/`

### Componenti e fondamenta — ✅ gemme da tenere

| File | Verdetto | Perché / Note |
|---|---|---|
| `client/src/components/layout/AnimatedBackground.jsx` | ✅ DA TENERE | Sfondo animato a particelle. Autosufficiente, nessuna dipendenza, pulito. Copia così com'è. |
| `client/src/components/markets/TradingViewWidget.jsx` | ✅ DA TENERE | Wrapper riutilizzabile per i widget TradingView, già protetto dal doppio montaggio di React. Ottimo. |
| `client/src/components/layout/Sidebar.jsx` | ✅ DA TENERE | Menu laterale + toggle tema. Solo da aggiornare le voci e il nome del brand. |
| `client/src/context/ThemeContext.jsx` | ✅ DA TENERE | Tema verde/scuro con salvataggio. Minuscolo e funzionante (rinomina la chiave localStorage). |
| `client/tailwind.config.js` | ✅ DA TENERE | Colori card centralizzati + font "Space Grotesk". Buon pattern: cambi 3 righe e cambi tutte le card. |
| `client/src/api/client.js` | ✅ DA TENERE | Wrapper fetch pulito con gestione errori. Ottimo template: adatta solo la lista di endpoint. |
| `client/src/store/sessionStore.js` | ✅ DA TENERE | Store Zustand minimale e chiaro. |
| `client/src/store/uiStore.js` | ✅ DA TENERE | Idem, piccolo. |
| `client/vite.config.js` | ✅ DA TENERE | Contiene i proxy `/api` e `/uploads` (fix già fatto). Tienilo. |
| `client/src/index.css` · `main.jsx` · `index.html` · `postcss.config.js` | ✅ DA TENERE | Boilerplate di base corretto. |

### Chat e sessione — 🔧 buona base, da adattare

| File | Verdetto | Perché / Note |
|---|---|---|
| `client/src/components/chat/ChatPanel.jsx` | 🔧 DA ADATTARE | Struttura chat buona. Da rivedere quando l'AI leggerà davvero le immagini (sparisce l'avviso "text-only"). |
| `client/src/components/chat/MessageBubble.jsx` | 🔧 DA ADATTARE | Mini-componente, ok. Eventualmente migliorare la resa del markdown. |
| `client/src/components/chat/UploadArea.jsx` | 🔧 DA ADATTARE | Drag&drop + incolla + rimozione file. Buono; togliere i riferimenti a "Vision locale". |
| `client/src/components/session/SessionMemory.jsx` | 🔧 DA ADATTARE | Pannello memoria con indicatore di bias. Riusabile, dipende da come struttureremo la memoria. |

### Pagine — 🔧 stile da tenere, struttura da ripulire

> Lo **stile visivo** di tutte le pagine è bello e va mantenuto. Il **codice**, però,
> in alcuni casi va riorganizzato (vedi duplicazioni).

| File | Verdetto | Perché / Note |
|---|---|---|
| `client/src/pages/Markets.jsx` (Home) | 🔧 DA ADATTARE | La home (hero, candela, calendario, vetrina, mini-widget) è il pezzo estetico migliore. **Ma** contiene componenti widget copiati anche in `TradingLive.jsx`. |
| `client/src/pages/TradingLive.jsx` | 🔧 DA ADATTARE | Cruscotto mercati completo (grafico, heatmap, news, calendario). **Duplica** molto codice con Markets.jsx → estrarre i widget in componenti condivisi. |
| `client/src/pages/Workspace.jsx` | 🔧 DA ADATTARE | Pagina più grande e centrale (chat, memoria, snapshot, focus mode). Funziona ma è grossa: conviene spezzarla in sotto-componenti. |
| `client/src/pages/Dashboard.jsx` | 🔧 DA ADATTARE | "Le mie Analisi": lista, tag, modali, cestino. Solida, riusabile. |
| `client/src/pages/Journal.jsx` | 🔧 DA ADATTARE | Tabella diario + modale modifica + statistiche. Buona. |
| `client/src/pages/Timeline.jsx` | 🔧 DA ADATTARE | Timeline + stampa PDF. Buona. |
| `client/src/pages/Notes.jsx` | 🔧 DA ADATTARE | Blocco note con autosalvataggio. Riusabile ma è un "extra". |
| `client/src/pages/SearchPage.jsx` | 🔧 DA ADATTARE | Ricerca client-side semplice. Ok. |
| `client/src/App.jsx` | 🔧 DA ADATTARE | Le rotte: buon punto di partenza, adatta i nomi. |

---

## 3. SERVER (il motore) — `server/`

### Fondamenta del motore — ✅ gemme da tenere

| File | Verdetto | Perché / Note |
|---|---|---|
| `server/src/db/database.js` | ✅ DA TENERE ⭐ | **Pezzo migliore del backend.** Sistema di migrazioni automatico + wrapper asincroni (`runQuery/getQuery/allQuery`). Da tenere se restiamo su SQLite (vedi domanda DB nel file 03). |
| `server/src/db/migrations/*.sql` | ✅ DA TENERE | Lo schema delle tabelle. Ottimo riferimento anche se si cambia database. |
| `server/src/agent/providerClient.js` | ✅ DA TENERE ⭐ | Lo "smistatore" di provider AI. Ben progettato ed estensibile. Ci aggiungeremo l'adapter del modello con vista (Claude/Sonnet). |
| `server/src/agent/skillLoader.js` | ✅ DA TENERE | Carica e mette in cache i file `kit/`. Pulito. |
| `server/src/index.js` | ✅ DA TENERE | Avvio Express, caricamento `.env`, file statici, gestione errori. Pulito (togliere il "warmup" del vision locale). |
| `server/src/routes/sessions.js` | ✅ DA TENERE | CRUD sessioni + chiusura + snapshot + delete a cascata. Coerente e robusto. |
| `server/src/routes/agent.js` | ✅ DA TENERE | Upload (Multer), analisi, parsing CSV journal. Solida (togliere riferimenti vision locale). |
| `server/src/routes/journal.js` | ✅ DA TENERE | CRUD journal + export CSV. Buona. |
| `server/src/routes/messages.js` | ✅ DA TENERE | Messaggi. Ok. |
| `server/src/routes/news.js` | ✅ DA TENERE | News RSS italiane con cache e fallback (feed già verificati). Buona. |
| `kit/` (tutti i file) | ✅ DA TENERE | È il "cervello/comportamento" dell'agente. **Da ripulire dai nomi di metodo da non citare.** Va portato com'è. |

### Da adattare o ripensare

| File | Verdetto | Perché / Note |
|---|---|---|
| `server/src/agent/orchestrator.js` | 🔧 DA ADATTARE | Logica centrale buona, ma: (1) il nome modello è scritto a mano nel payload, va preso dalla config; (2) tutta la gestione "se non legge le immagini" sparirà con un'AI con vista. |
| `server/src/agent/promptBuilder.js` | 🔧 DA ADATTARE | Costruisce i messaggi + immagini. Tieni la parte "immagini come blocchi per provider con vista"; **togli** il ramo Vision-locale/Ollama. |
| `server/src/agent/providers/openrouterProvider.js` | 🔧 DA ADATTARE | Adapter OpenRouter (ha la vista). Buon modello da cui partire per l'adapter Anthropic/Sonnet. |
| `.env.example` | 🔧 DA ADATTARE | Buon modello di configurazione; va ripulito (via le righe Ollama/HF se cambiamo motore). |

### Da NON riusare — ❌

| File | Verdetto | Perché |
|---|---|---|
| `server/src/agent/visionService.js` | ❌ DA NON RIUSARE | Modulo "Vision locale" con Ollama: è un ripiego lento (30–90s su CPU) nato perché Gemma non vede le immagini. Con un'AI che vede davvero, non serve più. |
| `server/src/agent/providers/huggingfaceProvider.js` | ❌ DA NON RIUSARE (come motore principale) | Gemma è text-only: è la causa del limite centrale. Si può conservare il file come esempio di adapter, ma **non** come AI principale. |
| `test-hf-gemma.js` | ❌ DA NON RIUSARE | Script di test usa-e-getta. |
| `server/server/data/aware_trading.db` (orfano) | ❌ DA NON RIUSARE | Database duplicato/orfano da non portare. |
| `StazioneTrading/mcp.json`, `mcp.json` | ❌ valutare | Config strumenti, non codice app. |
| `.env.local` | ❌ NON COPIARE COSÌ | Contiene chiavi reali e un modello inesistente (`gemma-4-31B-it`). Riparti dal `.env.example` ripulito; le chiavi vanno reinserite a mano, mai committate. |

---

## 4. Cosa va deciso PRIMA di copiare (rimandi al file 03)

Alcune scelte cambiano *quanto* di questo codice si riusa. Sono nel file-intervista `03`:

- **Quale AI** useremo per leggere i grafici? (decide se l'adapter OpenRouter basta o serve Anthropic dedicato; decide se buttare Gemma/Ollama).
- **Quale database**: restiamo su SQLite locale (riusiamo `database.js` quasi com'è) o passiamo a Supabase/Postgres (riscriviamo il livello dati ma teniamo lo schema)?
- **Quali funzioni** della beta tenere subito e quali rimandare (Note, Cerca, Snapshot, Trading Live…).

---

## Check-list di questo documento

- [x] Inventario completo client (componenti, store, pagine)
- [x] Inventario completo server (database, agente, route, kit)
- [x] Marcate le gemme ✅, gli adattamenti 🔧 e gli scarti ❌
- [x] Segnalate le duplicazioni e i file orfani da non portare
- [ ] Prossimo: rispondere a `03_INTERVISTA-PER-NUOVO-PROGETTO.md` per finalizzare le scelte
