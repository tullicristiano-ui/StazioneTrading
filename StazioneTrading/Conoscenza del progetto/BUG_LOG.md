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

*(nessun bug aperto)*

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
*Ultima modifica: — | Bug aperti: 0 | Bug risolti: 0*
