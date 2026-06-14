# AGENT CONTEXT — Aware Trading Workspace

> File di contesto sintetico da passare ad agenti esterni (GitHub Copilot, Claude, ecc.) come primo messaggio per dare orientamento rapido sul progetto.

---

## Cos'è questo progetto

**Aware Trading Workspace** è una webapp personale (localhost, utente singolo) per sessioni di analisi di trading assistite da un agente AI. L'agente legge screenshot di grafici e applica il metodo "Aware Trader" per supportare il trader nel leggere la struttura del mercato. **Non genera segnali operativi e non fornisce consigli finanziari.**

---

## Stack tecnologico

| Layer | Tecnologia |
|---|---|
| Frontend | React + Vite + Tailwind CSS + Zustand |
| Backend | Node.js + Express |
| Database | SQLite (`sqlite3`, API asincrona) |
| AI Provider | Multi-provider via `AI_PROVIDER`: **HuggingFace/Gemma (in uso ora, text-only)** o OpenRouter (vision) |
| Upload file | Multer |
| Routing client | react-router-dom |

> **Provider attivo oggi:** `AI_PROVIDER=huggingface` (Gemma). Gemma è **text-only** → l'agente NON legge gli screenshot (le immagini si caricano e si vedono, ma all'AI arriva solo una nota testuale). L'analisi visiva reale arriverà con **Anthropic/Sonnet** (vision) — vedi PROJECT_PLAN.md §3.5.

---

## Struttura cartelle

```
aware-trading-workspace/
├── client/src/
│   ├── pages/          Dashboard.jsx | Workspace.jsx | Journal.jsx | Timeline.jsx
│   ├── components/     chat/ (ChatPanel, MessageBubble, UploadArea) | session/ | journal/
│   ├── store/          sessionStore.js | uiStore.js (Zustand)
│   └── api/            client.js (fetch wrapper)
├── server/src/
│   ├── routes/         sessions.js | messages.js | agent.js | journal.js
│   ├── agent/
│   │   ├── orchestrator.js       ← logica principale + generateSessionSummary + richiesta screenshot mancante
│   │   ├── skillLoader.js        ← carica file kit
│   │   ├── promptBuilder.js      ← costruisce i messaggi (screenshot in formato vision: 1 msg user con content array)
│   │   ├── providerClient.js     ← router provider (getActiveProvider)
│   │   └── providers/
│   │       ├── openrouterProvider.js   ← adapter OpenRouter (vision)
│   │       └── huggingfaceProvider.js  ← adapter HuggingFace/Gemma (text-only)
│   └── db/             database.js | migrations/001_init.sql | migrations/002_close_session_and_snapshots.sql
└── kit/                File skill dell'agente (01,02,04,06,07,08,09 del Trade Analysis Agent Kit v3)
```

---

## Database (SQLite) — 5 tabelle

- **sessions**: `id, created_at, updated_at, asset, status, title, summary, closed_at` (`summary`/`closed_at` aggiunti in migration 002)
- **messages**: `id, session_id, created_at, role, content, screenshots (JSON array di path)`
- **session_memory**: `id, session_id, asset, timeframes, structure, levels, notes, updated_at`
- **journal_entries**: tutti i campi del CSV journal (vedi PROJECT_PLAN.md §2)
- **snapshots**: `id, session_id, created_at, name, asset, status, memory_json, messages_json` (migration 002)

### Sistema migrazioni
`database.js` applica in ordine alfabetico tutti i file `.sql` in `migrations/` e ne tiene traccia nella tabella `schema_migrations` (ogni file eseguito una sola volta). Per aggiungere uno schema: creare un nuovo file numerato (es. `003_*.sql`) — verrà applicato all'avvio.

---

## Logica agente AI

1. **Skill Loader** (`skillLoader.js`): legge i file `.md` in `/kit/` all'avvio e li concatena come system prompt.
2. **Prompt Builder** (`promptBuilder.js`): prende history messaggi da DB + nuovo messaggio + screenshot (convertiti in data URL base64) e costruisce l'array `messages`. Gli screenshot sono impacchettati nel formato vision standard: **un unico messaggio `user` con `content` = array `[testo, image_url...]`** (corretto per OpenRouter/Anthropic; l'adapter HuggingFace lo appiattisce a testo).
3. **Provider Client** (`providerClient.js`): seleziona il provider da `AI_PROVIDER` e delega a `providers/openrouterProvider.js` o `providers/huggingfaceProvider.js`. Espone anche `getActiveProvider()`.
4. **Orchestrator** (`orchestrator.js`): coordina i moduli, salva la risposta in `messages`, aggiorna `session_memory`. Include `generateSessionSummary()` (riassunto alla chiusura sessione) e, se non sono allegati screenshot in modalità standard/new_analysis, istruisce l'agente a chiederli.

### Selezione provider
Si configura via `.env` — nessun cambio di codice:
```
AI_PROVIDER=huggingface     → HuggingFace Inference API (Gemma, text-only)   ← ATTIVO ORA
AI_PROVIDER=openrouter      → OpenRouter (vision, modelli Anthropic/GPT/ecc.)
```

---

## API principali

| Metodo | Endpoint | Scopo |
|---|---|---|
| POST/GET/PATCH/DELETE | `/api/sessions` · `/api/sessions/:id` | CRUD sessioni. PATCH (asset/status/title) **non** tocca `updated_at`; DELETE elimina la sessione e tutto il collegato (messaggi, `session_memory`, snapshot, `journal_entries`, cartella `uploads/:id`) |
| POST | `/api/sessions/:id/close` | Chiude la sessione + riassunto AI in `summary` |
| POST/GET | `/api/sessions/:id/snapshots` | Crea / elenca snapshot |
| GET | `/api/sessions/:id/snapshots/:snapshotId` | Apre un singolo snapshot (sola lettura) |
| POST | `/api/agent/analyze` | Turno di analisi (testo + screenshot multipart) |
| GET | `/api/agent/info` | `{ provider, visionSupported }` (per avviso UI text-only) |
| POST/GET | `/api/messages` · `/api/journal` · `/api/journal/export.csv` | Messaggi e journal |

---

## Flusso principale (happy path)

```
Utente scrive messaggio + allega/incolla screenshot
  → POST /api/agent/analyze {session_id, content, screenshots[]}
  → Multer salva screenshot in /uploads/{session_id}/
  → Orchestrator costruisce prompt (system + history + messaggio + immagini base64)
  → providerClient.requestCompletion() → provider selezionato da AI_PROVIDER
      [huggingface] → strip immagini + nota testuale (text-only)   ← ATTIVO ORA
      [openrouter]  → invia immagini come image_url blocks (vision)
  → Risposta salvata in messages (role: "assistant")
  → Session memory aggiornata
  → Frontend mostra risposta nella chat
```

---

## Variabili d'ambiente richieste

```
# Provider attivo (oggi: huggingface)
AI_PROVIDER=huggingface

# HuggingFace (se AI_PROVIDER=huggingface)
HUGGINGFACE_API_KEY=hf_...        # oppure HF_TOKEN
HUGGINGFACE_MODEL=google/gemma-2-9b-it

# OpenRouter (se AI_PROVIDER=openrouter)
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Server
PORT=3001
DB_PATH=./server/data/aware_trading.db
UPLOADS_PATH=./server/uploads
```

> Il server carica le variabili da `.env`, con fallback su `.env.local` (vedi `server/src/index.js`).

---

## CLI Tools — Comandi corretti

| Tool | Versione | Comando test |
|---|---|---|
| Node.js | v24.16.0 | `node -v` |
| npm | 11.13.0 | `npm -v` |
| Git | 2.54.0 | `git --version` |
| GitHub CLI | 2.93.0 | `gh --version` \| `gh auth status` |
| Supabase CLI | 2.105.0 | `npx supabase --version` |

> **Connettori esterni configurati:** GitHub (`tullicristiano-ui/StazioneTrading`) e Supabase (progetto attivo, regione `eu-west-2`, Postgres 17). **Nota:** l'app persiste su **SQLite locale**; Supabase non è ancora usato dal codice.

---

## Stato corrente del progetto

- **Fase 1 — MVP**: ✅ completata.
- **Fase 2 — Workflow Trading**: ✅ completata (trade aperto, session memory automatica, journal CSV).
- **Multi-provider**: ✅ implementato. In uso Gemma/HuggingFace; OpenRouter disponibile.
- **Fase 3 — Produttività**: ✅ completata (Timeline, Chiudi sessione con riassunto AI, Snapshot + apertura, ricerca/filtri, paste Ctrl+V, avviso modello text-only).
- **Restyling UI (2026-06-13/14)**: ✅ completato. Nuova home "Stazione di Trading" (sfondo nero-verde, canvas animato particelle, hero con descrizione, 4 CTA). Nuova pagina `TradingLive` (`/trading-live`) con tutti i widget TradingView. Sidebar aggiornata: 6 voci (Home · Trading Live · Nuova Analisi · Le mie Analisi · Journal · Note). Freccia ← "torna indietro" in ogni pagina. Fix Timeline sulla card analisi (in basso, non sovrapposta alle date).
- **Migliorie UI (2026-06-14)**: ✅ completato. `AnimatedBackground` estratto come componente condiviso (`components/layout/AnimatedBackground.jsx`) e applicato su tutte le pagine (sfondo `#050f0a` unificato). Home arricchita: orologio live + badge mercati (LON/NY/TYO aperti/chiusi), mini-calendario mese corrente. Badge stato sessioni nella Dashboard (🟢 Attiva oggi / 🟡 Recente / ⚪ Inattiva / ⚫ Chiusa). Indicatore bias visivo in SessionMemory (▲/▼/◆ da regex su `structure`). Statistiche Journal (totale analisi, asset più usato, ultima data). Nuova pagina Note rapide (`/note`) con salvataggio automatico in `localStorage`.
- **Tema + Widget Asset + Note avanzate (2026-06-14)**: ✅ completato. `ThemeContext` (`client/src/context/ThemeContext.jsx`) con hook `useTheme` e toggle verde/scuro persistito in `localStorage`. Tutte le 8 pagine usano `bgColor` reattivo (verde `#050f0a` / scuro `#0d1117`). Sidebar: pulsante toggle tema in fondo. Home: griglia 9 widget TradingView `MiniSymbolOverview` per BTC/EUR-USD/XAU/XAG/NASDAQ/US100/USOIL/ETH/DXY. Note riscritta: toolbar formattazione (grassetto, dimensione, font, colore), modalità checklist, salvataggio note con titolo + storico richiamabile con rinomina. Fix Focus Mode Workspace (sfondo coerente col tema). Pagina Cerca (`/cerca` + `SearchPage.jsx`) funzionante. 5 migliorie avanzate (banner sessione attiva, focus mode, ricerca globale, PDF timeline, tag sessioni) completate nella sessione precedente.
- **Provider vision**: da avviare su indicazione dell'utente (non imminente).
- Vedi `TASKS.md` per il dettaglio. `BUG_LOG.md`: 0 bug aperti.

---

## Regole importanti per chi contribuisce al codice

1. **Mai inserire API key nel codice** — solo `.env`.
2. **Le route Express usano sempre try/catch** con risposta JSON `{error: "..."}` in caso di errore.
3. **Gli upload sono limitati** a immagini (png/jpg/webp) max 10MB.
4. **Il system prompt dell'agente** è definito dai file in `/kit/` — non modificare il comportamento dell'agente cambiando il codice, modificare i file kit.
5. **SQLite usa l'API asincrona** (`sqlite3`) — usare i wrapper `runQuery`, `getQuery`, `allQuery`.
6. **Il frontend non accede direttamente al DB** — passa sempre dall'API Express.
7. **Zustand store** è la fonte di verità per lo stato UI.
8. **Per aggiungere provider**: creare `server/src/agent/providers/{nomeProvider}.js` con `export async function requestCompletion(payload)` e `export function parseResponse(data)`, poi registrarlo in `providerClient.js`.
9. **Per modifiche allo schema DB**: creare un nuovo file di migrazione numerato in `migrations/`.

---

## File di riferimento completo

Per l'architettura completa, le decisioni tecniche e il data model dettagliato: vedere `PROJECT_PLAN.md`.

---
*Versione contesto: 0.4 | Aggiornare dopo ogni cambio architetturale significativo*

## Ultime modifiche

- 2026-06-09: Implementato `new_analysis` flow server-side; refactoring multi-provider (adapter OpenRouter + HuggingFace/Gemma; `providerClient.js` provider router).
- 2026-06-11: **Fase 3 completata.** Sistema migrazioni multi-file con `schema_migrations`; migration 002 (`summary`/`closed_at` su sessions + tabella `snapshots`). Nuove route: `/api/sessions/:id/close`, `/api/sessions/:id/snapshots` (POST/GET), `/api/sessions/:id/snapshots/:snapshotId`, `/api/agent/info`. Timeline resa solida + proxy `/uploads` in Vite. Apertura snapshot in sola lettura; paste Ctrl+V; avviso modello text-only; l'agente chiede lo screenshot se manca.
- 2026-06-11: Fix formato screenshot in `promptBuilder.js` (un unico messaggio user con content array — pronto per provider vision). Decisione: in uso solo Gemma/HuggingFace ora, Anthropic/Sonnet (vision) in futuro.
- 2026-06-12: **Dashboard migliorata.** Nuova route `DELETE /api/sessions/:id` (elimina sessione + collegati + cartella uploads). `PATCH /api/sessions/:id` non modifica più `updated_at` e allinea in cascata `session_memory.asset`. Regola d'oro: `sessions.updated_at` cambia **solo** su un vero scambio col modello (`POST /api/agent/analyze`, ramo non-preview), non su apertura/anteprima/snapshot/modifica metadati. Dashboard: sidebar fissa (Home + Journal), card con due date (Aperta/Aggiornata), cestino per eliminare, matita per modificare titolo/asset, modale "Nuova analisi" con Titolo e Asset separati. CLAUDE.md §1-bis: flusso a due agenti (ask pianifica/controverifica/push; esecutore implementa/commit, niente push).
- 2026-06-12: **Cruscotto Mercati (solo client, nessuna modifica server).** La home `/` ora è la pagina **`Markets`** (cruscotto a schede: **Grafico** avanzato · **Panoramica** · **Heatmap** Azioni/Crypto/Forex · **News** Azioni/Forex/Crypto/Macro · **Calendario** economico), basata su **widget gratuiti ufficiali TradingView** (nessuna chiave, nessun costo, richiede internet). La lista analisi/sessioni si è spostata su **`/analisi`** (componente `Dashboard` invariato); i pulsanti "Torna alle analisi" in Workspace/Journal puntano lì. **Sidebar condivisa a scomparsa** (hamburger): Mercati · Analisi · Journal. Nuovi file: `client/src/pages/Markets.jsx`, `client/src/components/markets/TradingViewWidget.jsx` (wrapper embed riusabile), `client/src/components/layout/Sidebar.jsx`. Lazy-mount: solo la scheda attiva monta il widget. Limiti noti (widget gratuiti): nessun login automatico all'account TradingView (solo login manuale nel Grafico), nessuna heatmap commodities, News "Macro" = feed `all_symbols`.
- 2026-06-13: **Home "Stazione di Trading" + Sidebar aggiornata.** `Markets.jsx` ridisegnata: hero con titolo gradiente, tagline, 3 CTA. Sidebar: brand → "Stazione di Trading", 5 voci (Home·Mercati·Nuova Analisi·Le mie Analisi·Journal). Fix pulsante Timeline nella card analisi (spostato in basso, "Vedi Timeline →"). Apertura modale "Nuova Analisi" via query param `?new=1`.
- 2026-06-14: **Home visiva + pagina Trading Live + frecce navigazione.** `Markets.jsx` completamente ridisegnata: sfondo `#050f0a`, canvas animato con 70 particelle verdi + linee di connessione (JavaScript puro, no librerie), icona candela SVG, descrizione app estesa, 4 CTA (incluso Trading Live), 3 feature cards glass. Nuovo file `client/src/pages/TradingLive.jsx` (`/trading-live`) con tutti i widget TradingView. Sidebar: "Trading Live" al posto di "Mercati". **Freccia ← "torna indietro"** aggiunta in tutte le pagine: TradingLive→/, Dashboard→/, Journal→/, Workspace→/analisi, Timeline→/workspace/:id.
- 2026-06-14: **Migliorie UI — sfondo unificato, widget home, badge, bias, stats, note.** `AnimatedBackground.jsx` estratto come componente condiviso. Sfondo `#050f0a` unificato su tutte le pagine. Home: orologio live (locale, aggiornato ogni secondo), badge mercati aperti/chiusi (LON/NY/TYO via orario UTC), mini-calendario mese corrente con oggi evidenziato. Dashboard: `SessionBadge` colorato per stato sessione. `SessionMemory`: `BiasIndicator` da regex su campo `structure`. Journal: `JournalStats` (3 card: totale, top asset, ultima data). Nuova pagina `Notes` (`/note`): textarea con autoSave localStorage 500ms. Sidebar: voce "Note" aggiunta (6 voci totali).
- 2026-06-14: **Tema dinamico + Widget asset + Note avanzate + 5 migliorie avanzate.** `ThemeContext.jsx` con toggle verde/scuro persistito; tutte le 8 pagine aggiornate. Home: 9 widget `MiniSymbolOverview` TradingView (griglia 3 colonne). Notes riscritta: formattazione testo (grassetto/dim/font/colore), checklist, salvataggio note con titolo e rinomina. `SearchPage.jsx` (`/cerca`): ricerca client-side per titolo/asset. 5 migliorie avanzate: banner sessione attiva in home, Focus Mode Workspace, ricerca globale, PDF Timeline (`window.print()`), tag/etichette sessioni (migration 003, PATCH esteso, TagEditor in Dashboard, chip in Workspace). Sidebar: 7 voci + toggle tema.
