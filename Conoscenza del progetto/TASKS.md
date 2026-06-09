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

## FASE 1 — MVP: Fondazioni

### F1-A: Setup progetto

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-A-01 | Creare cartella root del progetto | 🔴 P0 | `[ ]` | `aware-trading-workspace/` |
| F1-A-02 | Inizializzare `server/` con `npm init` | 🔴 P0 | `[ ]` | |
| F1-A-03 | Installare dipendenze server: `express cors multer better-sqlite3 dotenv uuid` | 🔴 P0 | `[ ]` | |
| F1-A-04 | Inizializzare `client/` con Vite React: `npm create vite@latest client -- --template react` | 🔴 P0 | `[ ]` | |
| F1-A-05 | Installare dipendenze client: `tailwindcss zustand react-router-dom` | 🔴 P0 | `[ ]` | |
| F1-A-06 | Configurare Tailwind CSS nel client | 🔴 P0 | `[ ]` | `tailwind.config.js` + `index.css` |
| F1-A-07 | Creare `.env` da `.env.example` e inserire API key | 🔴 P0 | `[ ]` | Non committare! |
| F1-A-08 | Creare `.gitignore` con le esclusioni previste | 🟠 P1 | `[ ]` | Vedi PROJECT_PLAN §5 |
| F1-A-09 | Copiare i file del kit in `/kit/` | 🔴 P0 | `[ ]` | File 01,02,04,06,07,08,09 |

### F1-B: Database e server base

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-B-01 | Creare `server/src/db/database.js` con init SQLite | 🔴 P0 | `[ ]` | Usa `better-sqlite3` |
| F1-B-02 | Creare `server/src/db/migrations/001_init.sql` con le 4 tabelle | 🔴 P0 | `[ ]` | sessions, messages, session_memory, journal_entries |
| F1-B-03 | Eseguire la migrazione all'avvio del server (auto-run in database.js) | 🔴 P0 | `[ ]` | `IF NOT EXISTS` per idempotenza |
| F1-B-04 | Creare `server/src/index.js` con Express base (cors, json, static uploads) | 🔴 P0 | `[ ]` | Porta da `.env` |
| F1-B-05 | Creare cartella `server/uploads/` con `.gitkeep` | 🟠 P1 | `[ ]` | |
| F1-B-06 | Testare avvio server su `localhost:3001` | 🟠 P1 | `[ ]` | GET `/health` deve rispondere 200 |

### F1-C: Routes API base

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-C-01 | Creare `routes/sessions.js`: `POST /api/sessions` (crea sessione) | 🔴 P0 | `[ ]` | Restituisce `{id, created_at, status}` |
| F1-C-02 | Creare `routes/sessions.js`: `GET /api/sessions` (lista sessioni) | 🔴 P0 | `[ ]` | Ordine DESC per `updated_at` |
| F1-C-03 | Creare `routes/sessions.js`: `GET /api/sessions/:id` (sessione singola + messages) | 🔴 P0 | `[ ]` | Include messages e session_memory |
| F1-C-04 | Creare `routes/sessions.js`: `PATCH /api/sessions/:id` (aggiorna asset/status) | 🟠 P1 | `[ ]` | |
| F1-C-05 | Creare `routes/messages.js`: `POST /api/messages` con Multer per upload immagini | 🔴 P0 | `[ ]` | Accetta `session_id`, `content`, `screenshots[]` |
| F1-C-06 | Validare tipi file upload (solo png/jpg/webp, max 10MB) | 🟠 P1 | `[ ]` | In Multer fileFilter |
| F1-C-07 | Salvare screenshot in `/uploads/{session_id}/` con nome UUID | 🟠 P1 | `[ ]` | |
| F1-C-08 | Creare `routes/journal.js`: `POST /api/journal` (crea riga) | 🟠 P1 | `[ ]` | |
| F1-C-09 | Creare `routes/journal.js`: `GET /api/journal` (lista righe, opz. filtro session) | 🟡 P2 | `[ ]` | |
| F1-C-10 | Creare `routes/journal.js`: `GET /api/journal/export.csv` (esporta CSV) | 🟡 P2 | `[ ]` | Genera CSV con header da spec kit |

### F1-D: Agent Orchestrator

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-D-01 | Creare `agent/skillLoader.js`: legge i file `/kit/` e restituisce stringa concatenata | 🔴 P0 | `[ ]` | Cache in memoria all'avvio |
| F1-D-02 | Creare `agent/promptBuilder.js`: costruisce array `messages` per OpenRouter | 🔴 P0 | `[ ]` | system prompt + history + nuovo messaggio |
| F1-D-03 | `promptBuilder.js`: convertire screenshot in base64 per vision API | 🔴 P0 | `[ ]` | `fs.readFileSync` + `Buffer.toString('base64')` |
| F1-D-04 | `promptBuilder.js`: formato corretto per content blocks con immagini OpenRouter | 🔴 P0 | `[ ]` | `{type: "image_url", image_url: {url: "data:image/...;base64,..."}}`  |
| F1-D-05 | Creare `agent/providerClient.js`: chiamata fetch a OpenRouter | 🔴 P0 | `[ ]` | Headers: Authorization, HTTP-Referer, X-Title |
| F1-D-06 | `providerClient.js`: gestione errori API (rate limit, timeout, errori modello) | 🟠 P1 | `[ ]` | Risposta leggibile all'utente |
| F1-D-07 | Creare `agent/orchestrator.js`: coordina skillLoader + promptBuilder + providerClient | 🔴 P0 | `[ ]` | Funzione principale `runAnalysis(session_id, message, screenshots)` |
| F1-D-08 | Creare `routes/agent.js`: `POST /api/agent/analyze` — chiama orchestrator | 🔴 P0 | `[ ]` | Restituisce risposta agente + salva in DB |
| F1-D-09 | Testare chiamata end-to-end con immagine di test e messaggio libero | 🔴 P0 | `[ ]` | Verifica che l'agente risponda in stile kit |

### F1-E: Frontend base (React)

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F1-E-01 | Configurare `react-router-dom` con routes: `/`, `/workspace/:id`, `/journal` | 🔴 P0 | `[ ]` | |
| F1-E-02 | Creare `api/client.js` con wrapper fetch (base URL, headers, error handling) | 🔴 P0 | `[ ]` | |
| F1-E-03 | Creare Zustand store `sessionStore.js` (sessions list, current session, messages) | 🔴 P0 | `[ ]` | |
| F1-E-04 | Creare `pages/Dashboard.jsx`: lista sessioni recenti + pulsante "Nuova analisi" | 🔴 P0 | `[ ]` | |
| F1-E-05 | Dashboard: cliccando su sessione naviga a `/workspace/:id` | 🟠 P1 | `[ ]` | |
| F1-E-06 | Dashboard: "Nuova analisi" crea sessione via API e naviga al workspace | 🔴 P0 | `[ ]` | |
| F1-E-07 | Creare `pages/Workspace.jsx`: layout a 3 colonne (chat | upload | memory) | 🔴 P0 | `[ ]` | Responsive: su mobile stack verticale |
| F1-E-08 | Creare `components/chat/ChatPanel.jsx`: lista messaggi + input testo | 🔴 P0 | `[ ]` | |
| F1-E-09 | `ChatPanel.jsx`: scroll automatico all'ultimo messaggio | 🟠 P1 | `[ ]` | |
| F1-E-10 | `ChatPanel.jsx`: indicatore "L'agente sta scrivendo..." durante la chiamata AI | 🟠 P1 | `[ ]` | |
| F1-E-11 | Creare `components/chat/MessageBubble.jsx`: stile diverso per user/assistant | 🟠 P1 | `[ ]` | Prosa dell'agente: font leggibile, buon line-height |
| F1-E-12 | Creare `components/chat/UploadArea.jsx`: drag & drop + click per upload screenshot | 🔴 P0 | `[ ]` | Anteprima thumbnail prima dell'invio |
| F1-E-13 | `UploadArea.jsx`: invia messaggio + screenshot insieme via `POST /api/agent/analyze` | 🔴 P0 | `[ ]` | |
| F1-E-14 | Creare `components/session/SessionMemory.jsx`: pannello laterale con asset/TF/struttura/livelli | 🟠 P1 | `[ ]` | Dati da `session_memory` DB |
| F1-E-15 | Creare `pages/Journal.jsx`: tabella righe journal con export CSV | 🟡 P2 | `[ ]` | |

---

## FASE 2 — Workflow Trading

### F2-A: Analisi guidata

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F2-A-01 | Implementare flusso "Nuova analisi": l'agente chiede TF contesto → TF decisionale | 🟠 P1 | `[ ]` | Gestito lato agente dal prompt kit |
| F2-A-02 | Aggiungere "Modalità trade aperto" nel workspace con bottone dedicato | 🟠 P1 | `[ ]` | Cambia il prompt di sistema per la modalità 03b |
| F2-A-03 | `promptBuilder.js`: variante system prompt per "trade aperto" (include template 03b) | 🟠 P1 | `[ ]` | |
| F2-A-04 | Mostrare badge nella UI quando si è in modalità "trade aperto" | 🟡 P2 | `[ ]` | |

### F2-B: Session Memory automatica

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F2-B-01 | Dopo ogni risposta agente, estrarre info strutturate (asset, TF, struttura, livelli) | 🟠 P1 | `[ ]` | Chiamata AI secondaria leggera O parsing regex |
| F2-B-02 | Aggiornare tabella `session_memory` con dati estratti | 🟠 P1 | `[ ]` | |
| F2-B-03 | Aggiornare il pannello `SessionMemory.jsx` in tempo reale dopo ogni turno | 🟠 P1 | `[ ]` | |

### F2-C: Journal workflow

| ID | Task | Priorità | Stato | Note |
|---|---|---|---|---|
| F2-C-01 | Aggiungere pulsante "Genera riga journal" nella chat | 🟠 P1 | `[ ]` | Invia messaggio speciale che trigga format CSV dall'agente |
| F2-C-02 | Parsare la riga CSV dalla risposta agente e salvarla in DB | 🟠 P1 | `[ ]` | Regex su formato definito nel kit file 04 |
| F2-C-03 | Mostrare preview riga journal prima di salvarla | 🟡 P2 | `[ ]` | |
| F2-C-04 | Implementare export CSV completo da `GET /api/journal/export.csv` | 🟠 P1 | `[ ]` | Header CSV da file 05 del kit |

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
| V2-03 | Multi Provider: supporto HuggingFace e API custom oltre OpenRouter | |
| V2-04 | Import screenshot da clipboard (paste diretto nella chat) | |

---

## Checklist pre-commit

Prima di ogni commit, verificare:
- [ ] Nessuna API key nel codice
- [ ] Nessun `console.log` di dati sensibili
- [ ] I file `.env` e `/uploads/` sono in `.gitignore`
- [ ] Le nuove route hanno gestione errori try/catch
- [ ] I componenti React nuovi hanno PropTypes o TypeScript types

---
*Ultima modifica: — | Task totali fase 1: ~47 | Completati: 0*
