# ROADMAP — Aware Trading Workspace

> Visione d'insieme. Aggiornare solo a cambio di milestone o riorientamento strategico.

---

## Timeline stimata (sessioni di lavoro)

```
FASE 1 — MVP                    [~8-12 sessioni]
FASE 2 — Workflow Trading       [~4-6 sessioni]
FASE 3 — Produttività           [~3-5 sessioni]
```

---

## Fase 1 — MVP: Fondazioni

**Obiettivo:** avere un agente funzionante end-to-end, anche con UI minimale.

**Milestone M1** — Server funzionante
- [x] Progetto inizializzato (client + server)
- [x] SQLite con le 4 tabelle operative
- [x] Express con route `/health` che risponde
- [x] File kit copiati in `/kit/`

**Milestone M2** — Agente risponde
- [x] Skill loader carica tutti i file del kit
- [x] Prompt builder costruisce messaggio con history e screenshot base64
- [x] Provider client chiama OpenRouter senza errori
- [x] `POST /api/agent/analyze` restituisce risposta dell'agente in stile corretto

**Milestone M3** — UI base funzionante
- [x] Dashboard mostra lista sessioni
- [x] "Nuova analisi" crea sessione e apre workspace
- [x] Chat funziona: si può scrivere e ricevere risposta agente
- [x] Upload screenshot funziona: thumbnail preview + invio all'AI

**Milestone M4** — MVP completo
- [x] Pannello Session Memory mostra info rilevate
- [x] Sessioni persistono dopo refresh pagina
- [x] App usabile per una vera sessione di analisi

**Dipendenze critiche Fase 1:**
```
F1-A (setup) → F1-B (DB) → F1-C (routes) → F1-D (agent) → F1-E (UI)
                                                ↑
                                    Non iniziare F1-D senza aver
                                    testato almeno F1-C-01 e F1-C-05
```

---

## Fase 2 — Workflow Trading

**Obiettivo:** implementare i workflow specifici del kit (analisi guidata, trade aperto, journal).

**Milestone M5** — Flussi operativi
- [x] Modalità "trade aperto" distinguibile dalla pre-trade
- [ ] L'agente guida la richiesta di screenshot mancanti
- [x] Pulsante "genera riga journal" funzionante

**Milestone M6** — Journal operativo
- [x] Riga journal parsata e salvata in DB automaticamente
- [x] Export CSV scaricabile con header corretto
- [x] Visualizzazione tabella journal in pagina dedicata

**Milestone M6b** — Architettura multi-provider ✅
- [x] `providerClient.js` refactored come provider router
- [x] Adapter OpenRouter estratto in `providers/openrouterProvider.js`
- [x] Adapter HuggingFace/Gemma in `providers/huggingfaceProvider.js`
- [x] Selezione provider via `AI_PROVIDER` env — zero breaking changes
- [x] Gestione output Gemma: strip vision blocks, sanitize token speciali, fallback testo
- [x] Documentare che `OPENROUTER_API_KEY` è richiesto solo se `AI_PROVIDER=openrouter`

**Dipendenze:** Fase 2 richiede Fase 1 completa (Milestone M4).

---

## Fase 3 — Produttività

**Obiettivo:** migliorare la navigazione storica e la reportistica.

**Milestone M7** — Archivio e ricerca
- [ ] Ricerca sessioni per asset e data funzionante
- [ ] Sessioni hanno titolo e asset visibili in lista

**Milestone M8** — Timeline e report
- [ ] View timeline con messaggi + screenshot cronologici
- [ ] Chiusura sessione con riassunto generato dall'AI
- [ ] Snapshot analisi salvabili

**Dipendenze:** Fase 3 richiede Fase 2 completa (Milestone M6).

---

## Diagramma dipendenze

```
M1 (server base)
  └── M2 (agente risponde)
        └── M3 (UI base)
              └── M4 (MVP completo) ← PRIMO OBIETTIVO USABILE
                    └── M5 (flussi operativi)
                          └── M6 (journal operativo)
                                └── M6b (multi-provider) ✅
                                      └── M7 (archivio e ricerca)
                                            └── M8 (timeline e report)
```

---

## Rischi e note

| Rischio | Probabilità | Mitigazione |
|---|---|---|
| OpenRouter vision API non supporta bene base64 inline | Media | Testare subito in F1-D-09 con immagine di prova |
| Dimensione screenshot troppo grande per API (token) | Media | Ridimensionare immagini a max 1024px lato lungo prima dell'invio |
| Session memory automatica troppo lenta (doppia chiamata AI) | Alta | MVP: usare pulsante manuale "aggiorna memoria", automatico in Fase 2 |
| Prompt kit troppo lungo → superamento context window | Bassa | Misurare token totali del system prompt prima del deploy |
| SQLite non supporta query complesse per archivio | Bassa | Per ricerca semplice è sufficiente, FTS5 se necessario |
| HuggingFace 503 (modello in caricamento) su tier gratuito | Alta | Gestita nell'adapter con messaggio esplicito + eta; retry manuale |
| Gemma: output JSON non garantito per session_memory | Media | Gestita con parsing + fallback testo nell'orchestrator |

---

## Criteri di "done" per milestone

Una milestone è completata quando:
1. Le feature previste funzionano senza errori console critici
2. I dati persistono correttamente in SQLite dopo riavvio del server
3. L'agente risponde in stile conforme al kit (nessun elenco puntato, nessun paternalismo)
4. È stato fatto almeno un test manuale con screenshot reali di grafico

---
*Ultima modifica: 2026-06-09 | Fase corrente: Fase 3*
