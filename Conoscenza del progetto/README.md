# Aware Trading Workspace

> Webapp personale per sessioni di analisi assistita tramite agente AI specializzato nel metodo Aware Trader.

## Struttura del progetto

```
aware-trading-workspace/
├── README.md                  ← questo file
├── PROJECT_PLAN.md            ← architettura, stack, decisioni tecniche
├── TASKS.md                   ← task granulari con stato e priorità
├── ROADMAP.md                 ← fasi, milestone e dipendenze
├── BUG_LOG.md                 ← log bug attivi con tentativi di fix
├── AGENT_CONTEXT.md           ← contesto sintetico per agenti esterni
└── kit/                       ← file del Trade Analysis Agent Kit v3
    ├── 01_METODO_OPERATIVO.md
    ├── 02_PROMPT_MASTER_AGENT.md
    ├── 04_TEMPLATE_OUTPUT.md
    ├── 06_PROFILI_ASSET.md
    ├── 07_CAUTELE_TECNICHE.md
    ├── 08_STILE_RISPOSTA.md
    └── 09_PROFILO_AWARE_TRADER.md
```

## Vision

Creare una webapp personale che permetta al trader di svolgere sessioni di analisi assistita tramite un agente AI specializzato nella lettura dei grafici. L'agente applica il framework Aware Trader agli screenshot forniti, facilitando la comprensione della struttura del mercato e la costruzione di scenari. **Non genera segnali operativi e non fornisce consigli finanziari.**

## Principi fondamentali

- L'agente legge screenshot, identifica struttura, applica il metodo Aware Trader
- L'agente NON esegue ordini, NON gestisce rischio monetario, NON dice compra/vendi
- Utente singolo, nessuna monetizzazione, nessuna condivisione pubblica
- Priorità: coerenza del processo > velocità > funzionalità avanzate

## Stack tecnico (decisioni)

| Layer | Scelta | Motivazione |
|---|---|---|
| Frontend | React + Vite | Leggerezza, HMR veloce, compatibile con VS Code + Copilot |
| Styling | Tailwind CSS | Utility-first, niente config complessa |
| Backend | Node.js + Express | Semplicità, buon supporto multipart/form-data per upload |
| DB | SQLite (`sqlite3`, async) | File locale, zero infrastruttura, perfetto per uso singolo |
| AI Provider | Multi-provider via `AI_PROVIDER`: **Gemma/HuggingFace (in uso ora)** o OpenRouter | Chiave singola, adapter intercambiabili senza toccare il codice |
| Upload immagini | Multer | Standard Express per file handling |
| State management | Zustand | Leggero, compatibile con React 18 |

## Come usare questi file

- **TASKS.md**: lavoro quotidiano — spunta le task, aggiorna lo stato
- **ROADMAP.md**: visione d'insieme — non modificare frequentemente
- **BUG_LOG.md**: quando trovi un bug, aprilo e documenta tutto
- **AGENT_CONTEXT.md**: da passare ad agenti esterni (Copilot, Claude, ecc.) come contesto iniziale
- **PROJECT_PLAN.md**: riferimento architetturale — consultarlo prima di scrivere nuovo codice

## Stato corrente

| Fase | Stato |
|---|---|
| MVP (Fase 1) | ✅ Completata |
| Workflow Trading (Fase 2) | ✅ Completata |
| Produttività (Fase 3) | ✅ Completata |
| Vision / Sonnet (M9) | 🔴 Da fare |

> **Provider attivo:** Gemma via HuggingFace (`AI_PROVIDER=huggingface`), **text-only**: l'agente non legge ancora gli screenshot. L'analisi visiva reale arriverà con Anthropic/Sonnet (vedi PROJECT_PLAN.md §3.5).

## Aggiornamenti recenti

- Modalità `trade aperto`, estrazione automatica di `session_memory`, generazione/parsing/salvataggio righe journal CSV e pagina Journal con export.
- Architettura **multi-provider** (`AI_PROVIDER`): adapter OpenRouter (vision) e HuggingFace/Gemma (text-only).
- **Fase 3:** pagina **Timeline** (messaggi + screenshot cronologici), **Chiudi sessione** con riassunto AI, **Snapshot** nominabili + apertura in sola lettura, ricerca/filtri sessioni, **paste Ctrl+V** degli screenshot, avviso quando il modello è text-only.
- Fix del formato screenshot per l'AI (pronto per i provider con vision).

## Note operative

- `TASKS.md` e `ROADMAP.md` riflettono le Fasi 1-3 completate (Milestone M1–M8); prossimo obiettivo M9 (vision/Sonnet).
- `BUG_LOG.md`: 0 bug aperti.

## Avvio rapido

Segui questi passaggi per eseguire l'ambiente di sviluppo locale.

1. Copia il file di ambiente e inserisci le variabili richieste:

```powershell
copy ..\.env.example .env
# oppure (PowerShell o WSL)
cp ../.env.example .env
```

2. Apri due terminali separati.

3. Terminale 1 — Server:

```powershell
cd server
npm install
npm run dev
```

Il server di default ascolta su `http://localhost:3001`. Controlla lo stato con:

```powershell
curl http://localhost:3001/health
```

4. Terminale 2 — Client:

```powershell
cd client
npm install
npm run dev
```

Il client Vite è disponibile su `http://localhost:5173`.

**Nota:** all'avvio `server/src/db/database.js` applica in ordine **tutti** i file `.sql` in `server/src/db/migrations/` non ancora registrati (tracciamento nella tabella `schema_migrations`). Assicurati che `DB_PATH` punti a una cartella scrivibile.

---
*Documento creato: da aggiornare con data inizio*  
*PDR di riferimento: v0.1 — Aware Trading Workspace*  
*Kit di riferimento: Trade Analysis Agent Kit Operativo v3*
