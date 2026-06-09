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

---

## Flusso principale (happy path)

```
Utente scrive messaggio + allega screenshot
```