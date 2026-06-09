# TASKS — Aware Trading Workspace

> Aggiornare lo stato dopo ogni sessione di lavoro.  
> Stato: `[ ]` = da fare · `[~]` = in corso · `[x]` = completato · `[!]` = bloccato

---

## Legenda priorità
- 🔴 **P0** — bloccante, senza questo nulla funziona
- 🟠 **P1** — necessario per il milestone corrente
- 🟡 **P2** — utile ma posticipabile
- ⚪ **P3** — nice-to-have

---

## FASE 1 — MVP: Fondazioni ✅ Completata

### F1-A: Setup progetto

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-A-01 | Creare cartella root del progetto | 🔴 P0 | `[x]` | `aware-trading-workspace/` |
| F1-A-02 | Inizializzare `server/` con `npm init` | 🔴 P0 | `[x]` | |
| F1-A-03 | Installare dipendenze server: `express cors multer sqlite3 dotenv uuid` | 🔴 P0 | `[x]` | Usato `sqlite3` (async) su Windows |
| F1-A-04 | Inizializzare `client/` con Vite React | 🔴 P0 | `[x]` | |
| F1-A-05 | Installare dipendenze client: `tailwindcss zustand react-router-dom` | 🔴 P0 | `[x]` | |
| F1-A-06 | Configurare Tailwind CSS nel client | 🔴 P0 | `[x]` | |
| F1-A-07 | Creare `.env` da `.env.example` e inserire API key | 🔴 P0 | `[x]` | Non committare! |
| F1-A-08 | Creare `.gitignore` con le esclusioni previste | 🟠 P1 | `[x]` | |
| F1-A-09 | Copiare i file del kit in `/kit/` | 🔴 P0 | `[x]` | File 01,02,04,06,07,08,09 |
| F1-A-10 | Configurare `npm run dev` dalla root con `concurrently` | 🔴 P0 | `[x]` | |

### F1-B: Database e server base

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-B-01 | Creare `server/src/db/database.js` con init SQLite | 🔴 P0 | `[x]` | |
| F1-B-02 | Creare `server/src/db/migrations/001_init.sql` con le 4 tabelle | 🔴 P0 | `[x]` | |
| F1-B-03 | Eseguire la migrazione all'avvio del server | 🔴 P0 | `[x]` | |
| F1-B-04 | Creare `server/src/index.js` con Express base | 🔴 P0 | `[x]` | |
| F1-B-05 | Creare cartella `server/uploads/` con `.gitkeep` | 🟠 P1 | `[x]` | |
| F1-B-06 | Testare avvio server su `localhost:3001` | 🟠 P1 | `[x]` | |

### F1-C: Routes API base

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-C-01 | `POST /api/sessions` | 🔴 P0 | `[x]` | |
| F1-C-02 | `GET /api/sessions` | 🔴 P0 | `[x]` | |
| F1-C-03 | `GET /api/sessions/:id` | 🔴 P0 | `[x]` | |
| F1-C-04 | `PATCH /api/sessions/:id` | 🟠 P1 | `[x]` | |
| F1-C-05 | `POST /api/messages` con Multer | 🔴 P0 | `[x]` | |
| F1-C-06 | Validare tipi file upload | 🟠 P1 | `[x]` | |
| F1-C-07 | Salvare screenshot in `/uploads/{session_id}/` | 🟠 P1 | `[x]` | |
| F1-C-08 | `POST /api/journal` | 🟠 P1 | `[x]` | |
| F1-C-09 | `GET /api/journal` | 🟡 P2 | `[x]` | |
| F1-C-10 | `GET /api/journal/export.csv` | 🟡 P2 | `[x]` | |

### F1-D: Agent Orchestrator

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-D-01 | `agent/skillLoader.js` | 🔴 P0 | `[x]` | |
| F1-D-02 | `agent/promptBuilder.js` base | 🔴 P0 | `[x]` | |
| F1-D-03 | Screenshot → base64 | 🔴 P0 | `[x]` | |
| F1-D-04 | Formato image_url blocks | 🔴 P0 | `[x]` | |
| F1-D-05 | `agent/providerClient.js` (originale OpenRouter) | 🔴 P0 | `[x]` | |
| F1-D-06 | Gestione errori API | 🟠 P1 | `[x]` | |
| F1-D-07 | `agent/orchestrator.js` | 🔴 P0 | `[x]` | |
| F1-D-08 | `routes/agent.js` `POST /api/agent/analyze` | 🔴 P0 | `[x]` | |
| F1-D-09 | Test end-to-end | 🔴 P0 | `[x]` | |

### F1-E: Frontend base (React)

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-E-01 | Routing react-router-dom | 🔴 P0 | `[x]` | |
| F1-E-02 | `api/client.js` fetch wrapper | 🔴 P0 | `[x]` | |
| F1-E-03 | Zustand `sessionStore.js` | 🔴 P0 | `[x]` | |
| F1-E-04 | `Dashboard.jsx` | 🔴 P0 | `[x]` | |
| F1-E-05 | Navigazione dashboard → workspace | 🟠 P1 | `[x]` | |
| F1-E-06 | "Nuova analisi" crea sessione e naviga | 🔴 P0 | `[x]` | |
| F1-E-07 | `Workspace.jsx` layout | 🔴 P0 | `[x]` | |
| F1-E-08 | `ChatPanel.jsx` | 🔴 P0 | `[x]` | |
| F1-E-09 | Scroll automatico | 🟠 P1 | `[x]` | |
| F1-E-10 | Indicatore "agente scrive..." | 🟠 P1 | `[x]` | |
| F1-E-11 | `MessageBubble.jsx` | 🟠 P1 | `[x]` | |
| F1-E-12 | `UploadArea.jsx` drag & drop | 🔴 P0 | `[x]` | |
| F1-E-13 | Invio messaggio + screenshot | 🔴 P0 | `[x]` | |
| F1-E-14 | `SessionMemory.jsx` pannello laterale | 🟠 P1 | `[x]` | |
| F1-E-15 | `Journal.jsx` con export CSV | 🟡 P2 | `[x]` | |

---

## FASE 2 — Workflow Trading ✅ Completata

### F2-A: Analisi guidata

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F2-A-01 | Flusso "Nuova analisi": agente chiede TF contesto → TF decisionale | 🟠 P1 | `[x]` | Logica server-side |
| F2-A-02 | "Modalità trade aperto" con bottone dedicato | 🟠 P1 | `[x]` | |
| F2-A-03 | Variante system prompt "trade aperto" | 🟠 P1 | `[x]` | |
| F2-A-04 | Badge UI modalità "trade aperto" | 🟡 P2 | `[x]` | |

### F2-B: Session Memory automatica

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F2-B-01 | Estrazione info strutturate dopo risposta agente | 🟠 P1 | `[x]` | |
| F2-B-02 | Aggiornamento tabella `session_memory` | 🟠 P1 | `[x]` | |
| F2-B-03 | Pannello `SessionMemory.jsx` in tempo reale | 🟠 P1 | `[x]` | |

### F2-C: Journal workflow

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F2-C-01 | Pulsante "Genera riga journal" nella chat | 🟠 P1 | `[x]` | |
| F2-C-02 | Parsing riga CSV da risposta agente + salvataggio DB | 🟠 P1 | `[x]` | |
| F2-C-03 | Preview riga journal prima di salvare | 🟡 P2 | `[x]` | |
| F2-C-04 | Export CSV completo | 🟠 P1 | `[x]` | |

### F2-D: Multi-provider ✅ Completato (2026-06-09)

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F2-D-01 | Refactoring `providerClient.js` come provider router | 🟠 P1 | `[x]` | Seleziona provider da `AI_PROVIDER` env |
| F2-D-02 | Adapter `providers/openrouterProvider.js` | 🟠 P1 | `[x]` | Estratto dall'originale, model da env `OPENROUTER_MODEL` |
| F2-D-03 | Adapter `providers/huggingfaceProvider.js` | 🟠 P1 | `[x]` | Gemma text-only, strip vision blocks, sanitize output |
| F2-D-04 | Aggiornare `.env.example` con `AI_PROVIDER`, `HUGGINGFACE_API_KEY`, `HUGGINGFACE_MODEL` | 🟠 P1 | `[x]` | |
| F2-D-05 | Test regressione OpenRouter invariato | 🔴 P0 | `[x]` | Interfaccia `requestCompletion`/`parseCompletionResponse` identica |
| F2-D-06 | Test Gemma via HuggingFace con chat standard | 🟠 P1 | `[~]` | Da verificare con chiave reale |

### F2-D: Note di configurazione provider
| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F2-D-07 | Documentare la selezione `AI_PROVIDER` e i requisiti di chiave specifici | 🟡 P2 | `[x]` | `OPENROUTER_API_KEY` obbligatoria solo per OpenRouter |

---

## FASE 3 — Produttività

### F3-A: Timeline e archivio

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F3-A-01 | Aggiungere campo `asset` e `title` alla lista sessioni in Dashboard | 🟡 P2 | `[ ]` | |
| F3-A-02 | Implementare ricerca sessioni per data e asset | 🟡 P2 | `[ ]` | Filtro lato client o query SQL |
| F3-A-03 | Creare view "Timeline sessione": messaggi + screenshot in ordine cronologico | 🟡 P2 | `[ ]` | |
| F3-A-04 | Implementare "Chiudi sessione" con generazione riassunto automatico | ⚪ P3 | `[ ]` | Riassunto generato da AI |
| F3-A-05 | Snapshot analisi: salvare stato corrente come "snapshot" nominabile | ⚪ P3 | `[ ]` | |

---

## Backlog (V2 — futuro)

| ID | Task | Note |
|---|---|---|
| V2-01 | Skill Manager UI: visualizzare skill caricate, poterle attivare/disattivare | |
| V2-02 | Prompt Composer: interfaccia visuale per modificare l'harness | |
| V2-03 | Multi Provider: supporto HuggingFace e API custom oltre OpenRouter | ✅ Completato in F2-D |
| V2-04 | Import screenshot da clipboard (paste diretto nella chat) | |
| V2-05 | Aggiungere altri provider (Mistral, Ollama locale) seguendo il pattern adapter | Basta creare `providers/nomeProvider.js` |

---

## Checklist pre-commit

Prima di ogni commit, verificare:
- [ ] Nessuna API key nel codice
- [ ] Nessun `console.log` di dati sensibili
- [ ] I file `.env` e `/uploads/` sono in `.gitignore`
- [ ] Le nuove route hanno gestione errori try/catch
- [ ] I componenti React nuovi hanno PropTypes o TypeScript types

---
*Ultima modifica: 2026-06-09 | Fase 1: ✅ | Fase 2: ✅ | Fase 3: in corso*
