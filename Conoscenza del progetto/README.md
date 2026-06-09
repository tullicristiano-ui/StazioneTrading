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
| MVP (Fase 1) | 🔴 Non iniziato |
| Workflow Trading (Fase 2) | 🔴 Non iniziato |
| Produttività (Fase 3) | 🔴 Non iniziato |

---
*Documento creato: da aggiornare con data inizio*  
*PDR di riferimento: v0.1 — Aware Trading Workspace*  
*Kit di riferimento: Trade Analysis Agent Kit Operativo v3*
