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
| Database | SQLite (better-sqlite3) |
| AI Provider | OpenRouter (claude-3.5-sonnet con vision) |
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
│   ├── agent/          orchestrator.js | skillLoader.js | promptBuilder.js | providerClient.js
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
2. **Prompt Builder** (`promptBuilder.js`): prende history messaggi da DB + nuovo messaggio + screenshot (convertiti base64) e costruisce l'array `messages` per OpenRouter
3. **Provider Client** (`providerClient.js`): chiama `https://openrouter.ai/api/v1/chat/completions` con modello `anthropic/claude-3.5-sonnet`
4. **Orchestrator** (`orchestrator.js`): coordina i tre moduli, salva risposta in DB, aggiorna session_memory

---

## Flusso principale (happy path)

```
Utente scrive messaggio + allega screenshot
  → POST /api/agent/analyze {session_id, content, screenshots[]}
  → Multer salva screenshot in /uploads/{session_id}/
  → Orchestrator costruisce prompt (system + history + messaggio + immagini base64)
  → OpenRouter restituisce risposta agente
  → Risposta salvata in messages (role: "assistant")
  → Session memory aggiornata
  → Frontend mostra risposta nella chat
```

---

## Variabili d'ambiente richieste

```
OPENROUTER_API_KEY=sk-or-...
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

### Comandi interazione

**Git & GitHub**
```bash
git status
git remote -v
gh auth status
```

**Supabase**
```bash
npx supabase --version
npx supabase projects list
npx supabase link               # Collega progetto locale a Supabase cloud
npx supabase db push            # Push schema al DB remoto
npx supabase db pull            # Pull cambiamenti dal DB remoto
```

---

## Stato corrente del progetto

Controllare `TASKS.md` per lo stato dettagliato delle task.  
Controllare `ROADMAP.md` per la fase corrente.  
Controllare `BUG_LOG.md` per i bug aperti.

---

## Regole importanti per chi contribuisce al codice

1. **Mai inserire API key nel codice** — solo `.env`
2. **Le route Express usano sempre try/catch** con risposta JSON strutturata `{error: "..."}` in caso di errore
3. **Gli upload sono limitati** a immagini (png/jpg/webp) max 10MB
4. **Il system prompt dell'agente** è definito dai file in `/kit/` — non modificare il comportamento dell'agente modificando il codice, modificare i file kit
5. **SQLite è sincrono** (`better-sqlite3`) — non usare async/await sulle query DB
6. **Il frontend non accede direttamente al DB** — passa sempre dall'API Express
7. **Zustand store** è la fonte di verità per lo stato UI — non usare useState locale per dati condivisi tra componenti

---

## File di riferimento completo

Per l'architettura completa, le decisioni tecniche e il data model dettagliato: vedere `PROJECT_PLAN.md`.

---
*Versione contesto: 0.1 | Aggiornare dopo ogni cambio architetturale significativo*
