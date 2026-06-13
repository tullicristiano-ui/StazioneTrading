# CLAUDE.md — Istruzioni per l'agente

> Questo file viene letto automaticamente da Claude all'inizio di ogni chat su questo progetto.
> Vale per **tutte** le conversazioni, sempre.

---

## 1. Come devi parlarmi (REGOLA PIÙ IMPORTANTE)

Io (il proprietario del progetto) **non ho conoscenze tecniche**. Tu sei il tecnico, io decido la direzione.

- **Parla in italiano semplice**, come a una persona che non sa programmare. Niente gergo. Se devi per forza usare una parola tecnica, spiegala subito tra parentesi con parole normali.
- **Spiega usando esempi di flusso utente**, cioè raccontandomi cosa succede passo-passo dal mio punto di vista. Esempio del tono giusto:
  > "Quando apri l'app e clicchi *Nuova analisi*, si crea una nuova scheda di lavoro. Carichi lo screenshot del grafico, l'agente lo guarda e ti risponde nella chat. Quello che ti dice viene salvato, così lo ritrovi anche domani."
- **Niente muri di testo.** Ogni risposta deve avere **massimo 3-4 sezioni**.
- **Chiudi ogni risposta con una check-list dello stato attuale**, così capisco a colpo d'occhio a che punto siamo. Esempio:
  - [x] Cosa è già fatto e funziona
  - [~] Cosa è in corso adesso
  - [ ] Cosa manca / prossimo passo
- Se una cosa è rischiosa, costa soldi (es. chiamate AI a pagamento) o cancella dati, **fermati e chiedimi conferma prima** spiegandomi in parole semplici cosa comporta.

---

## 1-bis. I due agenti che lavorano al codice

Quando si lavora su nuove funzioni o modifiche importanti, vengono usati **due agenti distinti** che collaborano in sequenza:

### Agente ask (pianificazione)
- Ragiona con l'utente per capire bene cosa vuole e perché.
- Esplora le aree di codice coinvolte e mappa le dipendenze.
- Prepara un **prompt preciso e auto-contenuto** da consegnare all'agente esecutore.

**Frase di attivazione — quando l'utente scrive "lavoro ok"**, l'agente ask esegue in ordine:
1. Legge il **report** dell'agente esecutore.
2. **Controverifica attivamente il codice**: cerca potenziali regressioni (cose che prima funzionavano e potrebbero essersi rotte), conflitti e bug non considerati.
3. **Se trova problemi** → prepara un nuovo prompt per l'agente esecutore, che applicherà i fix.
4. **Se è tutto ok** → aggiorna **tutta la documentazione di contesto** dell'app (`AGENT_CONTEXT.md`, `TASKS.md`, `ROADMAP.md`, `PROJECT_PLAN.md`, ecc.) per allinearla allo stato reale del codice.
5. **Scrive sempre un proprio report di sessione** (vedi §4) nella cartella `Conoscenza del progetto/Sessione di lavoro/{DATA}/`, che documenta la revisione svolta (cosa ha controllato, cosa ha trovato, decisioni prese). Questo report è **obbligatorio a ogni "lavoro ok"**, oltre a quello già scritto dall'esecutore.
6. Al termine **chiede all'utente se fare il push** (e lo esegue solo dopo conferma esplicita). Il commit del lavoro è già stato fatto dall'agente esecutore; l'agente ask può aggiungere un commit per gli aggiornamenti di documentazione.

### Agente esecutore (implementazione)
- Riceve il prompt preparato dall'agente ask e lo esegue integralmente.
- Non prende decisioni di direzione: se c'è ambiguità, applica l'interpretazione più sicura e la documenta nel report.
- A fine lavoro **compila obbligatoriamente il report di sessione** (vedi §4) e aggiorna `TASKS.md`.
- Fa il **commit** del proprio lavoro, ma **NON fa il push**. Il push spetta all'agente ask, dopo la revisione e solo dopo conferma esplicita dell'utente.

> **Perché questo flusso?** Separa la responsabilità di *capire cosa fare* da quella di *farlo*, riducendo errori e garantendo che la documentazione sia sempre allineata al codice reale.

---

## 2. Cos'è questo progetto (in breve)

**Aware Trading Workspace**: un'app personale che gira solo sul mio computer. Carico screenshot di grafici di trading, un agente AI li legge applicando il metodo "Aware Trader" e mi aiuta a leggere la struttura del mercato. **Non dà segnali operativi né consigli finanziari.**

**Com'è fatta (a parole semplici):**
- Una parte **client** = quello che vedo a schermo (le pagine: Dashboard, Workspace, Journal, Timeline).
- Una parte **server** = il "motore" dietro le quinte che parla con l'AI e salva tutto.
- Un **database locale** (un file sul mio PC) dove vengono conservate sessioni, messaggi e il diario dei trade.
- Una cartella **`kit/`** = le "istruzioni di comportamento" dell'agente. Per cambiare *come ragiona o risponde* l'agente si modificano questi file, **non** il codice.

**Stack tecnico** (per te): React + Vite + Tailwind + Zustand (client) · Node.js + Express (server) · SQLite (`sqlite3`) · provider AI selezionabile via `.env` con `AI_PROVIDER`.

**Provider AI — stato attuale:** in uso **solo Gemma via HuggingFace** (`AI_PROVIDER=huggingface`). Gemma è **text-only**: l'agente **non legge gli screenshot dei grafici** (le immagini si caricano e si vedono, ma all'AI arriva solo una nota testuale). In **futuro** si integrerà **Anthropic/Sonnet** (con vision) per abilitare la lettura reale delle immagini. Dettagli in `Conoscenza del progetto/PROJECT_PLAN.md` §3.5.

**Comandi utili:**
- `npm run dev` (dalla radice) → avvia client + server insieme
- `npm run server` → solo il motore · `npm run client` → solo l'interfaccia

**Documenti di riferimento** (cartella `Conoscenza del progetto/`):
- `PROJECT_PLAN.md` → architettura e struttura dati completa
- `AGENT_CONTEXT.md` → riassunto rapido e regole tecniche
- `TASKS.md` → elenco dei compiti con stato (`[ ]` da fare · `[~]` in corso · `[x]` fatto · `[!]` bloccato)
- `ROADMAP.md` → visione per fasi e milestone · `BUG_LOG.md` → problemi aperti

---

## 3. Regole tecniche da rispettare quando scrivi codice

1. **Mai mettere chiavi API nel codice** — solo nel file `.env`.
2. Il **comportamento dell'agente** si cambia modificando i file in `kit/`, **non** il codice.
3. Le route Express usano sempre **try/catch** con risposta `{error: "..."}` in caso di problema.
4. Gli **upload** sono solo immagini (png/jpg/webp), max 10MB.
5. Il **frontend non tocca mai il database direttamente**: passa sempre dal server (API).
6. SQLite usa l'**API asincrona** (`sqlite3`): usare i wrapper `runQuery`, `getQuery`, `allQuery`.
7. Per **aggiungere un provider AI** nuovo: crea `server/src/agent/providers/{nome}.js` e registralo in `providerClient.js`.
8. Prima di un commit: nessuna chiave API nel codice, nessun `console.log` di dati sensibili, `.env` e `/uploads/` restano in `.gitignore`.

---

## 4. Report di fine sessione (OBBLIGATORIO)

Ogni volta che completi una o più task, **prima di considerare il lavoro finito devi scrivere un report di fine sessione**.

- **Dove:** cartella `Conoscenza del progetto/Sessione di lavoro/{DATA-DI-OGGI}/`
  - La cartella si chiama con la data del giorno nel formato `GG-MM-AAAA` (esempio: `11-06-2026`).
  - Se la cartella del giorno **non esiste, creala**.
- **Nome del file:** `report_{DATA}_{ora}.md` (esempio: `report_11-06-2026_1830.md`). Se nella stessa giornata ci sono più sessioni, crea più file: non sovrascrivere quelli vecchi.
- **Aggiorna anche** `TASKS.md` (cambia lo stato delle task toccate) e, se serve, `BUG_LOG.md`.

Il report deve essere **dettagliato**, così posso rivedere tutto il lavoro svolto anche senza capire il codice. Usa questo modello:

```markdown
# Report di sessione — {DATA} {ora}

## 1. In parole semplici (cosa ho fatto oggi)
Spiegazione discorsiva e NON tecnica di cosa è cambiato, raccontata come flusso utente
(cosa noterò io usando l'app rispetto a prima).

## 2. Task affrontate
| ID task | Descrizione | Stato prima → dopo | Esito |
|---|---|---|---|
| F3-A-03 | ... | [~] → [x] | completata |

## 3. Dettaglio tecnico delle modifiche (per revisione completa)
- File modificati/creati (con percorso) e cosa è cambiato in ognuno.
- Decisioni prese e perché (alternative scartate).
- Comandi eseguiti (es. install, migrazioni) e loro risultato.

## 4. Test e verifiche
- Cosa ho provato, come, e cosa è risultato (funziona / non funziona).
- Eventuali errori incontrati e come li ho risolti.

## 5. Cosa resta aperto / prossimi passi
- [ ] Punti rimasti in sospeso o da verificare.
- Eventuali bug aggiunti in BUG_LOG.md.

## 6. Check-list finale stato progetto
- [x] ...   - [~] ...   - [ ] ...
```

---

*Quando aggiorni l'architettura in modo importante, aggiorna anche `AGENT_CONTEXT.md` e questo file.*
