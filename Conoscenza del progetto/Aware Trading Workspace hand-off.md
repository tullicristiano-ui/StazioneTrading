# Aware Trading Workspace — Hand-off

Questo documento è la versione Markdown aggiornata del hand-off del progetto "Aware Trading Workspace". Fornisce un riassunto operativo per chi contribuisce al codice o integra agenti esterni.

## Cos'è questo progetto

Aware Trading Workspace è una webapp personale (localhost, utente singolo) per sessioni di analisi di trading assistite da un agente AI. L'agente legge screenshot di grafici e applica il metodo "Aware Trader" per supportare il trader nel leggere la struttura del mercato. Non fornisce consigli finanziari né segnali operativi.

## Stato attuale

- Phase 1-A (Project Setup) completata: struttura `server/`, `client/`, `kit/` creata, server Express e client React+Vite configurati, schema DB (SQLite) creato, primo commit effettuato.
- Avvio root verificato: `npm run dev` dalla root ora avvia server e client insieme, e la migrazione SQLite è stata fixata per evitare l'errore `no such table: main.messages`.
- Phase 2 iniziata: implementata la modalità `trade aperto`, l'estrazione automatica di `session_memory` dalla risposta agente, e il workflow di generazione automatica di righe journal in formato CSV.
- Prossime attività principali: test end-to-end del journal, affinare il parsing CSV del provider e migliorare l'interfaccia della UI per il monitoraggio delle sessioni e delle righe journal.

## Stack tecnologico

- Frontend: React + Vite + Tailwind CSS + Zustand
- Backend: Node.js + Express
- Database: SQLite (`sqlite3` npm package)
- Upload file: Multer
- AI Provider (MVP): OpenRouter (es. modello `anthropic/claude-3.5-sonnet`) o HuggingFace/Gemma in modalità text-only (`AI_PROVIDER=huggingface`)

## Struttura cartelle (principale)

```
aware-trading-workspace/
├── client/
│   └── src/ (React app)
├── server/
│   └── src/ (Express server, DB, agent)
├── kit/ (skill files .md usati come system prompt)
├── .env.example
└── Conoscenza del progetto/ (documentazione e hand-off)
```

## Database (SQLite) — tabelle principali

- `sessions`: id, created_at, updated_at, asset, status, title
- `messages`: id, session_id, created_at, role, content, screenshots (JSON)
- `session_memory`: id, session_id, asset, timeframes, structure, levels, notes, updated_at
- `journal_entries`: id, session_id, created_at, data, ora, asset, timeframe, bias, setup, entry, stop_loss, take_profit_1, take_profit_2, risk_reward, size, decisione_agente, decisione_trader, esito, durata_trade, nota, screenshot_link, csv_row

## Logica agente AI (overview)

1. `skillLoader.js`: legge i file `.md` in `/kit/` all'avvio e li concatena come system prompt.
2. `promptBuilder.js`: costruisce il payload che include history, nuovo messaggio e screenshot (base64).
3. `providerClient.js`: seleziona il provider da `AI_PROVIDER` e chiama OpenRouter o HuggingFace con gli headers corretti.
4. `orchestrator.js`: coordina i moduli sopra, salva la risposta in `messages` e aggiorna `session_memory`.

## Flusso principale (happy path)

1. Utente invia messaggio + screenshot → POST `/api/agent/analyze` (o endpoint equivalente)
2. Multer salva screenshot in `/uploads/{session_id}/`
3. Orchestrator costruisce prompt (system + history + message + immagini base64)
4. OpenRouter restituisce risposta agente
5. Risposta salvata in `messages` (role: `assistant`)
6. `session_memory` aggiornato con info strutturate (asset, timeframes, livelli)
7. Frontend mostra la risposta nella chat

## Variabili d'ambiente richieste

```
AI_PROVIDER=openrouter

# OpenRouter (se AI_PROVIDER=openrouter)
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# HuggingFace (se AI_PROVIDER=huggingface)
HUGGINGFACE_API_KEY=hf_...
HUGGINGFACE_MODEL=google/gemma-2-9b-it
HF_TOKEN=hf_...
HF_MODEL=google/gemma-2-9b-it

# Server
PORT=3001
DB_PATH=./server/data/aware_trading.db
UPLOADS_PATH=./server/uploads
```

## Regole importanti per i contributori

- Mai inserire API key nel codice; usare solo `.env` non committati.
- Le route Express devono usare `try/catch` con risposta JSON `{ error: "..." }` in caso di errore.
- Gli upload sono limitati a immagini (`png`, `jpg`, `webp`) max 10MB; validare MIME e dimensione.
- I file del kit (`/kit/*.md`) definiscono il system prompt dell'agente: modificarli per cambiare comportamento dell'agente.
- Non usare `async/await` con `better-sqlite3` (se si usa quel driver); con `sqlite3` usare le API asincrone fornite.
- Il frontend non accede direttamente al DB: tutte le operazioni passano per API Express.

## Comandi utili (sviluppo locale)

Esempio: avviare il server e il client in due terminali

```powershell
# Dalla root del progetto
cd server
npm run dev

# In un altro terminale
cd client
npm run dev
```

## File di riferimento

- `server/src/index.js` — entry point Express
- `server/src/db/database.js` — init DB e helper
- `server/src/db/migrations/001_init.sql` — schema iniziale
- `client/src/App.jsx` — routing principale
- `client/src/api/client.js` — wrapper fetch per API
- `kit/` — file .md che costituiscono il system prompt dell'agente
- `Conoscenza del progetto/AGENT_CONTEXT.md` — contesto sintetico per agenti esterni

---

*Versione: 0.2 — Aggiornato il 2026-06-09: hand-off convertito in Markdown e allineato allo stato Phase 1-A.*
