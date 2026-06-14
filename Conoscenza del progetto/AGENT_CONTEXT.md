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

> **Provider attivo oggi:** `AI_PROVIDER=huggingface` (Gemma). Gemma è **text-only** → di base l'agente NON legge gli screenshot (all'AI arriva solo una nota testuale).
> **Novità (14-06-2026) — Vision locale opzionale:** con `VISION_LOCAL_ENABLED=true` + Ollama (modello `qwen2.5vl:3b`) attivo sul PC, `visionService.js` descrive le immagini in locale (gratis) e inietta la descrizione nel messaggio a Gemma. Con interruttore spento (default) tutto resta come prima. In futuro, lettura nativa via **Anthropic/Sonnet** — vedi PROJECT_PLAN.md §3.5 e §3.5-bis.

---

## Struttura cartelle

```
aware-trading-workspace/
├── client/src/
│   ├── pages/          Dashboard.jsx | Workspace.jsx | Journal.jsx | Timeline.jsx
│   │                   TradingLive.jsx | SearchPage.jsx | Notes.jsx
│   ├── components/     chat/ (ChatPanel, MessageBubble, UploadArea)
│   │                   session/ | journal/ | layout/ (Sidebar, AnimatedBackground)
│   ├── context/        ThemeContext.jsx (toggle verde/scuro, persistito in localStorage)
│   ├── store/          sessionStore.js | uiStore.js (Zustand)
│   └── api/            client.js (fetch wrapper)
├── server/src/
│   ├── routes/         sessions.js | messages.js | agent.js | journal.js
│   ├── agent/
│   │   ├── orchestrator.js       ← logica principale + generateSessionSummary + richiesta screenshot mancante
│   │   ├── skillLoader.js        ← carica file kit
│   │   ├── promptBuilder.js      ← costruisce i messaggi; ramo Vision locale se huggingface+immagini+VISION_LOCAL_ENABLED
│   │   ├── visionService.js      ← modulo Vision locale (Ollama): describeImages(), cache SHA-256, isOllamaReachable()
│   │   ├── providerClient.js     ← router provider (getActiveProvider)
│   │   └── providers/
│   │       ├── openrouterProvider.js   ← adapter OpenRouter (vision)
│   │       └── huggingfaceProvider.js  ← adapter HuggingFace/Gemma (text-only)
│   └── db/             database.js | migrations/001_init.sql | migrations/002_close_session_and_snapshots.sql | migrations/003_tags.sql
└── kit/                File skill dell'agente (01,02,04,06,07,08,09 del Trade Analysis Agent Kit v3)
```

---

## Database (SQLite) — 5 tabelle

- **sessions**: `id, created_at, updated_at, asset, status, title, summary, closed_at, tags` (`summary`/`closed_at` in migration 002; `tags TEXT JSON` in migration 003)
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
| DELETE | `/api/sessions/:id/snapshots/:snapshotId` | Elimina un singolo snapshot (verifica appartenenza alla sessione) |
| POST | `/api/agent/analyze` | Turno di analisi (testo + screenshot multipart) |
| GET | `/api/agent/info` | `{ provider, visionSupported, visionLocal, visionModel, visionStatus }` — `visionStatus`: `disabled`/`offline`/`model_missing`/`ready` (avviso UI Vision locale) |
| POST/GET | `/api/messages` · `/api/journal` · `/api/journal/export.csv` | Messaggi e journal |

---

## Flusso principale (happy path)

```
Utente scrive messaggio + allega/incolla screenshot
  → POST /api/agent/analyze {session_id, content, screenshots[]}
  → Multer salva screenshot in /uploads/{session_id}/
  → Orchestrator costruisce prompt (system + history + messaggio + immagini base64)
  → promptBuilder: se huggingface + immagini + VISION_LOCAL_ENABLED=true
      → visionService.describeImages() → Ollama/Qwen2.5-VL locale → descrizione testuale iniettata
      (fallback non bloccante se Ollama spento; cache in memoria per immagine)
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
- **Restyling UI (2026-06-13/14)**: ✅ completato. Nuova home "Stazione di Trading" (sfondo nero-verde, canvas animato particelle, hero con descrizione, 4 CTA). Nuova pagina `TradingLive` (`/trading-live`) con tutti i widget TradingView. Sidebar: 7 voci + toggle tema (Home · Trading Live · Nuova Analisi · Le mie Analisi · Journal · Cerca · Note). Freccia ← "torna indietro" in ogni pagina. Fix Timeline sulla card analisi (in basso, non sovrapposta alle date).
- **Migliorie UI (2026-06-14)**: ✅ completato. `AnimatedBackground` estratto come componente condiviso. Sfondo `#050f0a` unificato su tutte le pagine. Home: orologio live + badge mercati (LON/NY/TYO), mini-calendario, 9 widget TradingView asset. Dashboard: badge stato sessione + TagEditor tag/etichette. `SessionMemory`: BiasIndicator (▲/▼/◆). Journal: statistiche 3 card. Note avanzate: toolbar formattazione, checklist, storico note con titolo. `ThemeContext` toggle verde/scuro persistito. Focus Mode Workspace. Pagina Cerca. PDF Timeline. Banner sessione attiva in home.
- **Vision locale (2026-06-14)**: ✅ completato. `visionService.js`: descrizione immagini via Ollama locale (Qwen2.5-VL 3B), cache SHA-256, warmup all'avvio. `promptBuilder.js`: ramo Vision + fix path `server/src/uploads`. `max_tokens` 1500 (Gemma non tronca più). `GET /api/agent/info` con `visionStatus`. Avviso verde in area upload quando Vision pronto.
- **Provider vision nativo**: da avviare su indicazione dell'utente (non imminente).
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
*Versione contesto: 0.5 | Aggiornare dopo ogni cambio architetturale significativo*

## Ultime modifiche

- 2026-06-09: Implementato `new_analysis` flow server-side; refactoring multi-provider (adapter OpenRouter + HuggingFace/Gemma; `providerClient.js` provider router).
- 2026-06-11: **Fase 3 completata.** Sistema migrazioni multi-file; migration 002 (summary/closed_at/snapshots). Route: close, snapshots, agent/info. Timeline solida; paste Ctrl+V; avviso text-only.
- 2026-06-12: **Dashboard migliorata.** DELETE sessione + collegati. PATCH non tocca updated_at. Dashboard: sidebar fissa, due date, cestino, matita, modale nuova analisi. Cruscotto Mercati (solo client, widget TradingView). CLAUDE.md §1-bis: flusso due agenti.
- 2026-06-13: Home "Stazione di Trading" + Sidebar. Fix Timeline nella card. Query param `?new=1`.
- 2026-06-14: **Home visiva + TradingLive + frecce navigazione.** Canvas animato, icona candela SVG, 4 CTA. TradingLive.jsx (`/trading-live`). Freccia ← in tutte le pagine.
- 2026-06-14: **Migliorie UI.** AnimatedBackground condiviso. Orologio live + badge mercati + mini-calendario. SessionBadge Dashboard. BiasIndicator SessionMemory. JournalStats. Notes con localStorage. Sidebar 6 voci.
- 2026-06-14: **Tema + Widget asset + Note avanzate + 5 migliorie avanzate.** ThemeContext toggle verde/scuro. 9 widget MiniSymbolOverview in home. Notes con formattazione e storico. SearchPage. Focus Mode. PDF Timeline. Tag sessioni (migration 003). Sidebar 7 voci + toggle tema.
- 2026-06-14: **Vision locale (Ollama + Qwen2.5-VL 3B) — implementazione + debug + performance.** Nuovo `visionService.js` (cache SHA-256, describeImages, isOllamaReachable, warmUpVisionModel). Fix critico path `uploadsRoot` in `promptBuilder.js` (`server/src/uploads` non `server/uploads`). Fix `UPLOADS_PATH` in `index.js`. `max_tokens` 1500 (Gemma non tronca più). `keep_alive:10m` + `num_predict:200` + warmup server per ridurre cold start da 20s a ~8s. Fallback Vision migliorato: nome file esplicito + istruzione a non richiedere screenshot già allegati. `/api/agent/info` con `visionStatus`. Avviso verde in area upload.
- 2026-06-14: **Analisi/Sessione — 3 migliorie (SESS-01…03).** (1) Session Memory affidabile: `kit/04_TEMPLATE_OUTPUT.md` impone una "scheda di sintesi" a fine risposta con campi etichettati (`Asset:`/`Timeframes:`/`Struttura:`/`Livelli:`/`Note:`, `n/d` se mancanti), dopo marcatore `---`; nota di eccezione in `kit/08_STILE_RISPOSTA.md`; la regex `parseSessionMemory` in orchestrator era già compatibile (nessuna modifica al codice). (2) Delete singolo snapshot: nuova route `DELETE /api/sessions/:id/snapshots/:snapshotId`, `api.deleteSnapshot`, `handleDeleteSnapshot` + bottone 🗑 con conferma in Workspace. (3) **Colori card centralizzati** in `client/tailwind.config.js`: `card #1d1a24` (interno), `card-inner #16131c` (annidate), `card-border #2a2533`. Sostituite SOLO le card (non input/bottoni/sidebar/dropzone) in 10 file. Per cambiare il colore di tutte le card in futuro basta modificare queste 3 righe.
- 2026-06-14: **Velocità analisi + rimozione screenshot (SPEED-01…06).** (A) `UploadArea.jsx`: bottone ✕ per togliere un singolo screenshot prima dell'invio (`removeFileAt`, solo frontend). (B) Velocità: `orchestrator.js` invia solo gli **ultimi 16 messaggi** (`ORDER BY created_at DESC LIMIT 16` + `reverse()`; `generateSessionSummary` invariata) e `max_tokens` 1500→800; `huggingfaceProvider.js` ora ha timeout sulla fetch (`AbortController`, env `HF_TIMEOUT_MS` default 90s) con messaggio chiaro su abort; `index.js` warmup vision con timeout 5s→120s (env `VISION_WARMUP_TIMEOUT_MS`) così il pre-caricamento è efficace; `VISION_TIMEOUT_MS` 120s→30s (chiamata vision in analisi). ⚠️ I ~30s NON sono garantiti finché resta `HF_MODEL=gemma-4-31B-it` (collo di bottiglia, scelta utente).
