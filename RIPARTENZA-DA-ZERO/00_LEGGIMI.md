# 🚀 Ripartire da zero — Pacchetto di partenza

> Questa cartella serve a **far ripartire il progetto in una repo nuova e pulita**,
> tenendo solo le parti dell'app beta attuale che sono **solide e funzionanti**,
> e buttando via ciò che è incompleto o problematico.
>
> Tutto è scritto in italiano semplice. Non serve saper programmare per leggerlo.

---

## A cosa servono questi file (e in che ordine leggerli)

| File | Cosa contiene | A chi serve |
|---|---|---|
| **00_LEGGIMI.md** (questo) | La mappa di tutto il pacchetto | A te, per orientarti |
| **01_COME-FUNZIONA-LAPP.md** | Spiegazione di cosa fa l'app oggi, raccontata come "cosa vedi tu usandola", più la parte tecnica | A te e all'agente che farà il piano |
| **02_CODICE-RIUTILIZZABILE.md** | L'elenco preciso di **quali file riusare** (e quali no) per non riscrivere da zero | All'agente esecutore della nuova app |
| **03_INTERVISTA-PER-NUOVO-PROGETTO.md** | Le domande che ti farò/farà l'agente per decidere com'è la versione "completa" | A te (rispondi) + all'agente che fa il piano |

---

## In due parole: qual è la situazione

- Oggi hai una **versione beta funzionante** (questa repo, "FREEDOM TRADING SYSTEM").
- L'**aspetto grafico** (lo stile scuro verde-acqua, lo sfondo animato, le schede, la home) è **bello e da tenere**.
- La **struttura tecnica del motore** (server, database, salvataggio sessioni, journal, mercati live) è **ben fatta e riusabile**.
- ⚠️ **Il problema più grosso:** la funzione centrale — *l'AI che guarda lo screenshot del grafico e lo legge* — **oggi NON funziona davvero**, perché il modello AI in uso (Gemma) è "cieco": legge solo testo, non le immagini. Questo va risolto nella versione nuova scegliendo un'AI che vede le immagini.

> Quindi: **ripartiamo tenendo l'estetica e l'ossatura tecnica**, e **sistemiamo il cuore** (l'AI che legge i grafici).

---

## Come useremo questo pacchetto (il flusso)

1. **Tu leggi** `01` e `02` per capire cosa abbiamo e cosa teniamo.
2. **Rispondi** alle domande in `03` (o le risponderai a voce all'agente che fa il piano).
3. Un **agente "pianificatore"** userà le tue risposte + `02` per scrivere il **Piano** della nuova app.
4. Un **agente "esecutore"** costruirà la nuova repo, **copiando i file marcati "DA TENERE"** in `02` e riscrivendo solo il resto.

---

## Check-list stato attuale

- [x] Repo beta studiata a fondo (client, server, database, kit, documenti)
- [x] Documentazione di funzionamento creata (file 01)
- [x] Inventario del codice riutilizzabile creato (file 02)
- [x] File-intervista con i dubbi da chiarire creato (file 03)
- [ ] **Tu:** leggere 01 e 02, rispondere alle domande di 03
- [ ] **Prossimo passo:** passare 02 + risposte all'agente che crea il Piano della nuova app
