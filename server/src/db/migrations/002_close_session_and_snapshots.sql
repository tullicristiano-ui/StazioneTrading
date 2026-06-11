-- F3-A-04 / F3-A-05 — Chiusura sessione con riassunto AI + Snapshot analisi

-- Riassunto generato dall'AI alla chiusura della sessione.
-- SQLite non supporta "ADD COLUMN IF NOT EXISTS": la colonna viene
-- aggiunta una sola volta perché questa migrazione è tracciata in
-- schema_migrations ed eseguita un'unica volta.
ALTER TABLE sessions ADD COLUMN summary TEXT;
ALTER TABLE sessions ADD COLUMN closed_at TEXT;

-- Snapshot nominabili dello stato di una sessione (F3-A-05).
-- Conservano una "fotografia" della session memory e dei messaggi
-- al momento dello snapshot, in formato JSON.
CREATE TABLE IF NOT EXISTS snapshots (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  asset TEXT,
  status TEXT,
  memory_json TEXT,
  messages_json TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_snapshots_session ON snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_created ON snapshots(created_at);
