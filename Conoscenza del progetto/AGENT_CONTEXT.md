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
| Database | SQLite (`sqlite3`) |
| AI Provider | Multi-provider: OpenRouter (default, con vision) o HuggingFace (Gemma, text-only) |
| Upload file | Multer |
| Routing client | react-router-dom |

---

## Struttura cartelle

```
aware-trading-workspace/
├── client/src/
│   ├── pages/          Dashboard.jsx | Workspace.jsx | Journal.jsx
│   ├── components/     chat/ | session/ | journal/
│   ├── store/          sessionStore.js | uiStore.js (Zustand)
│   └── api/            client.js (fetch wrapper)
├── server/src/
│   ├── routes/         sessions.js | messages.js | agent.js | journal.js
│   ├── agent/
│   │   ├── orchestrator.js       ← logica principale (invariata)
│   │   ├── skillLoader.js        ← carica file kit
│   │   ├── promptBuilder.js      ← costruisce i messaggi
│   │   ├── providerClient.js     ← router provider (AGGIORNATO)
│   │   └── providers/
│   │       ├── openrouterProvider.js   ← adapter OpenRouter
│   │       └── huggingfaceProvider.js  ← adapter HuggingFace/Gemma
│   └── db/             database.js | migrations/001_init.sql
└── kit/                File skill dell'agente (01,02,04,06,07,08,09 del Trade Analysis Agent Kit v3)
```

---

## Database (SQLite) — 4 tabelle

- **sessions**: `id, created_at, updated_at, asset, status, title`
- **messages**: `id, session_id, created_at, role, content, screenshots (JSON array di path)`
- **session_memory**: `id, session_id, asset, timeframes, structure, levels, notes, updated_at`
- **journal_entries**: tutti i campi del CSV journal (vedi PROJECT_PLAN.md §2)

---

## Logica agente AI

1. **Skill Loader** (`skillLoader.js`): legge i file `.md` in `/kit/` all'avvio e li concatena come system prompt
2. **Prompt Builder** (`promptBuilder.js`): prende history messaggi da DB + nuovo messaggio + screenshot (convertiti base64) e costruisce l'array `messages`
3. **Provider Client** (`providerClient.js`): seleziona il provider da `AI_PROVIDER` env e delega a `providers/openrouterProvider.js` o `providers/huggingfaceProvider.js`
4. **Orchestrator** (`orchestrator.js`): coordina i tre moduli, salva risposta in DB, aggiorna session_memory — **invariato**

### Selezione provider

Il provider si configura via `.env` — nessun cambio di codice necessario:
```
AI_PROVIDER=openrouter      → usa OpenRouter (vision support, modelli Anthropic/GPT/ecc.)
AI_PROVIDER=huggingface     → usa HuggingFace Inference API (Gemma, text-only)
```

### Selezione provider

Il provider si configura via `.env` — nessun cambio di codice necessario:
```
AI_PROVIDER=openrouter      → usa OpenRouter (vision support, modelli Anthropic/GPT/ecc.)
AI_PROVIDER=huggingface     → usa HuggingFace Inference API (Gemma, text-only)
```

---

## Flusso principale (happy path)

```
Utente scrive messaggio + allega screenshot
  → POST /api/agent/analyze {session_id, content, screenshots[]}
  → Multer salva screenshot in /uploads/{session_id}/
  → Orchestrator costruisce prompt (system + history + messaggio + immagini base64)
  → providerClient.requestCompletion() → provider selezionato da AI_PROVIDER
      [openrouter] → invia immagini come image_url blocks (vision)
      [huggingface] → strip immagini + nota testuale (text-only)
  → Risposta salvata in messages (role: "assistant")
  → Session memory aggiornata
  → Frontend mostra risposta nella chat
```

---

## Variabili d'ambiente richieste

```
# Provider attivo
AI_PROVIDER=openrouter

# OpenRouter (se AI_PROVIDER=openrouter)
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# HuggingFace (se AI_PROVIDER=huggingface)
HUGGINGFACE_API_KEY=hf_...
HUGGINGFACE_MODEL=google/gemma-2-9b-it

# Server
PORT=3001
DB_PATH=./server/data/aware_trading.db
UPLOADS_PATH=./server/uploads
```

---

## CLI Tools — Comandi corretti

| Tool | Versione | Comando test |
|---|---|---|
| Node.js | v24.16.0 | `node -v` |
| npm | 11.13.0 | `npm -v` |
| npx | 11.13.0 | `npx -v` |
| Git | 2.54.0 | `git --version` |
| GitHub CLI | 2.93.0 | `gh --version` \| `gh auth status` |
| Supabase CLI | 2.105.0 | `npx supabase --version` |

---

## Stato corrente del progetto

- **Fase 1 — MVP**: completata.
- **Fase 2 — Workflow Trading**: completata (trade aperto, session memory automatica, journal CSV).
- **Multi-provider**: implementato. OpenRouter continua a funzionare; HuggingFace/Gemma disponibile via `AI_PROVIDER=huggingface`.
- **Fase 3 — Produttività**: da iniziare (ricerca sessioni, timeline, report).
- Verificare `TASKS.md` per il dettaglio delle task in corso.
- `BUG_LOG.md` contiene i problemi ancora aperti.

---

## Regole importanti per chi contribuisce al codice

1. **Mai inserire API key nel codice** — solo `.env`
2. **Le route Express usano sempre try/catch** con risposta JSON strutturata `{error: "..."}` in caso di errore
3. **Gli upload sono limitati** a immagini (png/jpg/webp) max 10MB
4. **Il system prompt dell'agente** è definito dai file in `/kit/` — non modificare il comportamento dell'agente modificando il codice, modificare i file kit
5. **SQLite usa l'API asincrona** (`sqlite3`) — il driver in uso è async, usare i wrapper `runQuery`, `getQuery`, `allQuery`
6. **Il frontend non accede direttamente al DB** — passa sempre dall'API Express
7. **Zustand store** è la fonte di verità per lo stato UI
8. **Per aggiungere provider**: creare `server/src/agent/providers/{nomeProvider}.js` con `export async function requestCompletion(payload)` e `export function parseResponse(data)`, poi registrarlo in `providerClient.js`

---

## File di riferimento completo

Per l'architettura completa, le decisioni tecniche e il data model dettagliato: vedere `PROJECT_PLAN.md`.

---
*Versione contesto: 0.3 | Aggiornare dopo ogni cambio architetturale significativo*

## Ultime modifiche

- 2026-06-09: Implementato `new_analysis` flow server-side (commit 69de11e).
- 2026-06-09: Aggiornamento task F2-A-01 in `TASKS.md` (commit 318f448).
- 2026-06-09: Refactoring multi-provider: introdotti adapter OpenRouter e HuggingFace/Gemma; `providerClient.js` diventa provider router; zero breaking changes su API e orchestrator.
