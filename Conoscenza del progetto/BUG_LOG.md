# BUG LOG — Aware Trading Workspace

> Questo file va aggiornato dall'agente ogni volta che si incontra un bug.
> **Non cancellare mai i bug risolti** — spostarli nella sezione "Bug risolti" con la soluzione applicata.

---

## Come usare questo file

Quando si incontra un bug:
1. Aprire questo file
2. Aggiungere una nuova entry nella sezione "Bug attivi"
3. Compilare tutti i campi (almeno: ID, Titolo, Descrizione, Come riprodurre)
4. Aggiornare la entry dopo ogni tentativo di fix
5. Quando risolto: spostare in "Bug risolti" con la soluzione finale

**Prompt per l'agente:** *"Aggiorna il BUG_LOG.md con questo bug: [descrizione]. Apri una nuova entry, descrivi il problema, come riprodurlo e documenta i tentativi di fix man mano che li proviamo."*

---

## Bug attivi

*Nessun bug attivo al momento.* Le entry qui sotto sono **già risolte** e conservate come cronologia (non si cancellano mai i bug risolti).

### BUG-003 — News: categoria "Mercati" sempre vuota (feed RSS morti)

**Stato:** ✅ Risolto
**Priorità:** P1 Importante
**Data apertura:** 2026-06-18
**Componente:** `server/src/routes/news.js`
**Fase progetto:** Fase 3

#### Descrizione
Aprendo Trading Live → News, la categoria "Mercati" (caricata di default) appariva sempre vuota. Tre dei feed RSS configurati (Il Sole 24 Ore, Milano Finanza, Borsa Italiana) rispondevano HTTP 404: gli URL non esistevano più. La route gestisce i feed morti con un fallback silenzioso (`catch → []`), quindi non andava in 500, ma la lista risultava vuota. Anche la categoria "Economia" aveva un feed morto (Il Sole 24 Ore). L'utente percepiva un "internal server error" perché aveva l'app aperta con il server precedente (privo della route news) ancora in esecuzione.

#### Come riprodurre
1. Avviare `npm run dev`
2. Trading Live → tab News → sotto-tab "Mercati"
3. Atteso: lista di notizie. Ottenuto (prima del fix): "Nessuna notizia disponibile" (lista vuota).

#### Soluzione finale
Sostituiti i feed RSS morti con fonti italiane verificate una per una (HTTP 200 con notizie reali):
- **Mercati:** Wall Street Italia, Investing.com Mercati (IT), Money.it.
- **Economia:** ANSA Economia (nuovo), Corriere, Repubblica (questi due già funzionanti; rimosso Il Sole 24 Ore morto).
Aggiunto uno `User-Agent` "Mozilla/5.0" al parser RSS (alcune testate rifiutano richieste senza UA) e rimosso un `AbortController` creato ma non utilizzato (il timeout era già gestito dal Parser). Verifica post-fix: `/api/news?category=mercati` → 35 notizie; `economia` → 40 notizie; categoria inesistente → fallback 200 senza crash.

---

### BUG-002 — Screenshot non visibili in dev (manca proxy /uploads in Vite)

**Stato:** ✅ Risolto
**Priorità:** P2 Minore
**Data apertura:** 2026-06-11
**Componente:** `client/vite.config.js`, `client/src/pages/Timeline.jsx`, `client/src/components/chat/MessageBubble.jsx`
**Fase progetto:** Fase 3

#### Descrizione
Gli screenshot vengono salvati con path `/uploads/{sessionId}/file.png` e serviti dal server Express (porta 3001). In sviluppo il client gira su Vite (porta 5173) che proxava solo `/api`, quindi i tag `<img src="/uploads/...">` puntavano alla porta sbagliata e le immagini non si caricavano (sia nella chat sia nella nuova Timeline).

#### Come riprodurre
1. Avviare `npm run dev`
2. Aprire una sessione con screenshot allegati
3. Atteso: l'immagine appare. Ottenuto (prima del fix): immagine rotta/non caricata in dev.

#### Soluzione finale
Aggiunto il proxy `/uploads` → `http://localhost:3001` in `client/vite.config.js`. Così gli screenshot si caricano sia in dev (proxy) sia in produzione (stesso origin). Nella Timeline gli screenshot sono inoltre cliccabili (aprono l'immagine a piena dimensione in una nuova scheda).

---

### BUG-001 — Provider HuggingFace non selezionato correttamente in dev mode

**Stato:** ✅ Risolto
**Priorità:** P1 Importante
**Data apertura:** 2026-06-09
**Componente:** `server/src/agent/orchestrator.js`, `server/src/agent/providerClient.js`
**Fase progetto:** Fase 2

#### Descrizione
Quando `AI_PROVIDER` era impostato su `huggingface`, il backend restituiva un errore di chiave `OPENROUTER_API_KEY` anche se il provider corretto era HuggingFace.

#### Come riprodurre
1. Impostare `AI_PROVIDER=huggingface` in `.env.local`
2. Lasciare `OPENROUTER_API_KEY` vuoto o non configurata
3. Avviare il server e inviare una richiesta di analisi
4. Il sistema rispondeva con `Agente Aware: non è configurata la chiave OPENROUTER_API_KEY`

#### Contesto tecnico
- `providerClient.js` supporta `openrouter` e `huggingface`.
- `orchestrator.js` controllava `OPENROUTER_API_KEY` prima di sapere quale provider era attivo.
- In `.env.example`, `AI_PROVIDER` è documentato, ma il fix richiede allineamento tra valore e adapter esistente.

#### Tentativi di fix

**Tentativo 1 — 2026-06-09**
- Ipotesi: validazione chiave OpenRouter eseguita in modo troppo presto nell'orchestrator.
- Modifica: aggiunto `activeProvider = getActiveProvider()` e condizione `if (activeProvider === 'openrouter' && !process.env.OPENROUTER_API_KEY)`.
- Risultato: ✅ Risolto
- Note: ora il server supporta correttamente `AI_PROVIDER=huggingface` senza richiedere chiavi OpenRouter.

#### Soluzione finale
La causa radice era una validazione non condizionata di `OPENROUTER_API_KEY` dentro `orchestrator.js` indipendentemente dal provider selezionato. La fix separa la validazione e la rende dipendente dal valore di `AI_PROVIDER`, mantenendo la compatibilità con il router provider.

---

## Template entry

```
### BUG-XXX — [Titolo breve]

**Stato:** 🔴 Aperto | 🟡 In analisi | 🟠 Fix in corso | ✅ Risolto
**Priorità:** P0 Bloccante | P1 Importante | P2 Minore
**Data apertura:** YYYY-MM-DD
**Componente:** [es. server/agent/orchestrator.js | client/components/chat/UploadArea.jsx]
**Fase progetto:** [Fase 1 / Fase 2 / Fase 3]

#### Descrizione
[Descrizione chiara del comportamento errato]

#### Come riprodurre
1. [Passo 1]
2. [Passo 2]
3. [Risultato atteso]
4. [Risultato ottenuto]

#### Contesto tecnico
- Versione Node.js: 
- Browser: 
- OS: 
- Messaggio di errore (console / terminal):
```
[incollare errore completo]
```

#### Tentativi di fix

**Tentativo 1 — YYYY-MM-DD**
- Ipotesi: [cosa si pensava fosse il problema]
- Modifica: [cosa è stato modificato e dove]
- Risultato: ❌ Non risolto | ⚠️ Parziale | ✅ Risolto
- Note: [cosa si è imparato]

**Tentativo 2 — YYYY-MM-DD**
- Ipotesi: 
- Modifica: 
- Risultato: 
- Note: 

#### Soluzione finale
[Da compilare solo quando risolto — descrivere la causa radice e la fix applicata]

---
```

---

## Bug risolti

*(nessun bug risolto ancora)*

---
*Ultima modifica: 2026-06-18 | Bug aperti: **0** | Bug risolti: 3 (BUG-001, BUG-002, BUG-003)*

> Nota: il fatto che con Gemma (text-only) l'agente non legga gli screenshot **non è un bug** ma una limitazione nota del provider attuale; sarà superata con un modello vision (Sonnet). Vedi `PROJECT_PLAN.md` §3.5.
