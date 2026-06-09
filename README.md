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

2. Apri due terminali separati.

3. Terminale 1 — Server:

```powershell
cd server
npm install
npm run dev
```

Il server di default ascolta su `http://localhost:3001`. Verifica lo stato con:

```powershell
curl http://localhost:3001/health
```

4. Terminale 2 — Client:

```powershell
cd client
npm install
npm run dev
```

Il client Vite è disponibile su `http://localhost:5173`.

## Note utili

- Assicurati di NON commitare file `.env` contenenti chiavi API.
- Lo script `server/src/index.js` esegue automaticamente le migrazioni SQL all'avvio (se `DB_PATH` è impostato correttamente).
- Se usi Windows e trovi problemi a installare pacchetti nativi, è stato scelto `sqlite3` come driver per la compatibilità locale.

---

Per dettagli architetturali e tasks, consulta la cartella `Conoscenza del progetto/`.
