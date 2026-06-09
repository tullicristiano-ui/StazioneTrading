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
| DB | SQLite (better-sqlite3) | File locale, zero infrastruttura, perfetto per uso singolo |
| AI Provider | OpenRouter (MVP) | Multi-modello, vision support, chiave API singola |
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
| Workflow Trading (Fase 2) | 🟠 In corso |
| Produttività (Fase 3) | 🔴 Non iniziato |

## Aggiornamenti recenti

- Implementata la modalità `trade aperto` con toggle UI e prompt specializzato.
- Aggiunta estrazione automatica di `session_memory` da ogni risposta agente.
- Implementata generazione, parsing e salvataggio delle righe journal CSV.
- Aggiunta la pagina Journal con esportazione CSV e visualizzazione delle voci salvate.

## Note operative

- `TASKS.md` è aggiornato con lo stato corrente delle task di Fase 2.
- `ROADMAP.md` riflette l'avanzamento verso le milestone M5/M6.

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

**Nota:** lo `server/src/index.js` esegue le migrazioni SQL in `server/src/db/migrations/001_init.sql` all'avvio (se `DB_PATH` è impostato). Assicurati che `DB_PATH` punti a una cartella scrivibile.

---
*Documento creato: da aggiornare con data inizio*  
*PDR di riferimento: v0.1 — Aware Trading Workspace*  
*Kit di riferimento: Trade Analysis Agent Kit Operativo v3*
