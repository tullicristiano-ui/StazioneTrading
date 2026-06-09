# Aware Trading Workspace

Repository principale per l'applicazione Aware Trading Workspace.

Questa repo contiene il backend Express (`server/`), il frontend React + Vite (`client/`) e i file di knowledge/kit per l'agente AI (`kit/` e `Conoscenza del progetto/`).

## Avvio rapido (sviluppo locale)

1. Copia il file di ambiente e inserisci le variabili richieste:

```powershell
copy .env.example .env
# oppure
cp .env.example .env
```

2. Installa le dipendenze dalla root del repository:

```powershell
npm install
```

3. Avvia l'intero progetto dalla root con un solo comando:

```powershell
npm run dev
```

Questo comando avvierà automaticamente:
- il server Express su `http://localhost:3001`
- il client Vite su `http://localhost:5173`
## Stato attuale

- Phase 1 completata: backend, frontend, DB e upload funzionanti.
- Phase 2 in corso: implementata la modalità `trade aperto`, l'estrazione automatica di `session_memory` e il workflow journal CSV.
- Per lo stato dettagliato, consulta `Conoscenza del progetto/TASKS.md` e `Conoscenza del progetto/ROADMAP.md`.
4. Verifica lo stato del backend con:

```powershell
curl http://localhost:3001/health
```

Il client Vite è disponibile su `http://localhost:5173`.

## Note utili

- Assicurati di NON commitare file `.env` contenenti chiavi API.
- Lo script `server/src/index.js` esegue automaticamente le migrazioni SQL all'avvio (se `DB_PATH` è impostato correttamente).
- Se usi Windows e trovi problemi a installare pacchetti nativi, è stato scelto `sqlite3` come driver per la compatibilità locale.

---

Per dettagli architetturali e tasks, consulta la cartella `Conoscenza del progetto/`.
