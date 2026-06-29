# 03 — Intervista per la nuova app (domande + dubbi)

> Questo file serve a **raccogliere le tue decisioni** prima di costruire la nuova app.
> Un agente "pianificatore" userà le tue risposte (insieme al file `02`) per scrivere il Piano.
>
> **Come usarlo:** leggi ogni domanda e scrivi la risposta nello spazio `→ RISPOSTA:`.
> Non serve rispondere a tutto subito: le domande sono ordinate per importanza.
> Dove non sai cosa scegliere, c'è una **proposta consigliata** che puoi accettare.

---

## 🔴 SEZIONE 1 — Le decisioni che cambiano tutto (rispondi prima a queste)

### D1. L'AI che legge i grafici (la decisione numero 1)
Oggi l'AI **non vede** gli screenshot. Nella versione nuova vogliamo che li veda davvero.
- (a) Va bene usare un modello a pagamento ma potente come **Claude/Sonnet** (vede le immagini, ottima qualità)?
- (b) Hai un budget mensile indicativo per l'AI? (es. pochi euro, ~20€, di più)
- (c) Vuoi poter cambiare modello facilmente in futuro (consigliato: sì)?

*Proposta consigliata:* usare un modello Claude con vista come motore principale, tenendo lo "smistatore" già esistente per poterlo cambiare.

→ RISPOSTA:


### D2. Dove vengono salvati i dati (database)
- (a) **Solo sul tuo PC** (file locale SQLite) — semplice, privato, ma vivi su un solo computer.
- (b) **Nel cloud** (Supabase/Postgres) — accessibile da più dispositivi, backup automatici, ma più complesso e con un account esterno.

*Proposta consigliata:* restare **solo sul PC** finché è un uso personale; passare al cloud solo se vuoi usarla da più dispositivi.

→ RISPOSTA:


### D3. L'app resta solo per te, sul tuo computer?
- Resta personale/locale (nessun login)? Oppure un domani vuoi che la usino **altre persone** / sia online?
- (Se anche solo "forse in futuro", dimmelo: cambia molto l'impostazione di sicurezza e account.)

*Proposta consigliata:* personale e locale per ora.

→ RISPOSTA:


### D4. Cosa portiamo subito e cosa rimandiamo
Quali di queste funzioni vuoi **fin da subito** nella nuova app? (segna sì/no)
- [ ] Chat con analisi del grafico (il cuore) — *praticamente obbligatoria*
- [ ] Trading Live (grafici, heatmap, news, calendario)
- [ ] Journal dei trade + export CSV
- [ ] Timeline + PDF
- [ ] Snapshot delle sessioni
- [ ] Memoria della sessione (riquadro laterale)
- [ ] Note
- [ ] Cerca
- [ ] Tag/etichette
- [ ] Tema chiaro/scuro

→ RISPOSTA:


---

## 🟠 SEZIONE 2 — Come deve comportarsi l'agente AI

### D5. Lettura del grafico: cosa deve fare esattamente?
Quando carichi uno screenshot, l'AI dovrebbe:
- descrivere la struttura (trend, supporti/resistenze, pattern)?
- darti una "lettura" del contesto senza segnali operativi (come ora)?
- compilare automaticamente la riga del journal?
- altro?

→ RISPOSTA:


### D6. Il "carattere" e il metodo dell'agente
Nella cartella `kit/` ci sono le istruzioni di comportamento dell'agente.
- Vanno bene così (le riusiamo ripulite) o vuoi rivederle/riscriverle?
- Confermo che **non si deve citare** un certo nome di metodo nei testi visibili: vuoi un nome/identità diversa per l'agente? Quale?

→ RISPOSTA:


### D7. Lingua e tono
- Tutto in italiano (come ora)?
- Tono dell'agente: tecnico, didattico, sintetico, amichevole?

→ RISPOSTA:


---

## 🟡 SEZIONE 3 — Aspetto e funzionamento

### D8. Estetica
- Confermi che teniamo lo **stile attuale** (scuro verde-acqua, sfondo animato, schede)?
- Cambiamo il nome? Ora è "FREEDOM TRADING SYSTEM": lo teniamo o ne scegliamo un altro?
- C'è qualcosa dell'aspetto attuale che **non** ti piace e vuoi cambiare?

→ RISPOSTA:


### D9. Mercati e dati esterni
- Teniamo i widget **TradingView** e le **news RSS italiane** come ora?
- Ci sono asset/strumenti specifici che ti servono in primo piano?

→ RISPOSTA:


### D10. Multi-dispositivo e accesso
- La userai solo da questo PC o anche da telefono/tablet?
- (Influisce su database, login e responsive.)

→ RISPOSTA:


---

## 🟢 SEZIONE 4 — Pratiche e organizzazione

### D11. Nuova repo
- La nuova app va in una **repo GitHub nuova** (consigliato) o nella stessa cartella?
- Hai già un nome per la nuova repo?

→ RISPOSTA:


### D12. Backup e sicurezza dei dati
- Vuoi un modo semplice per **fare il backup** delle tue sessioni/journal (es. esporta tutto in un file)?

→ RISPOSTA:


### D13. Priorità e tempi
- Cosa vuoi vedere funzionante **per primo**? (es. "prima di tutto l'AI che legge il grafico")
- Hai una scadenza o è senza fretta?

→ RISPOSTA:


---

## 📌 Dubbi tecnici aperti che propongo di risolvere comunque (anche senza tua risposta)

Questi li segnalo perché vanno sistemati a prescindere; salvo tua contrarietà, l'agente del piano li darà per assodati:

1. **Eliminare il modulo Vision locale (Ollama)** e il provider Gemma come motore: sostituiti da un'AI con vista.
2. **Togliere i file orfani/di test** (`test-hf-gemma.js`, database duplicato `server/server/data/`).
3. **Rimuovere il nome di metodo da non citare** da tutti i testi e dai file `kit/`.
4. **De-duplicare i widget mercati** condivisi tra Home e Trading Live in componenti unici.
5. **Spostare il nome del modello AI dalla riga di codice alla configurazione** `.env`.
6. **Spezzare `Workspace.jsx`** (molto grande) in sotto-componenti più piccoli.

→ Sei d'accordo su tutti? (sì / no, e quali no):


---

## Check-list di questo documento

- [x] Domande critiche (AI, database, perimetro, funzioni) in cima
- [x] Domande su comportamento agente, estetica, mercati
- [x] Domande pratiche (repo, backup, priorità)
- [x] Lista dei dubbi tecnici da risolvere comunque
- [ ] **Tu:** compila le risposte (almeno la Sezione 1)
- [ ] Poi: consegna questo file + `02` all'agente che scrive il Piano
