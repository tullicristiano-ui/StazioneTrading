-- Aware Trading Workspace Database Schema

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  asset TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  title TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  screenshots TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_memory (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  asset TEXT,
  timeframes TEXT,
  structure TEXT,
  levels TEXT,
  notes TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  created_at TEXT NOT NULL,
  data TEXT,
  ora TEXT,
  asset TEXT,
  timeframe TEXT,
  bias TEXT,
  setup TEXT,
  modalita TEXT,
  entry TEXT,
  stop_loss TEXT,
  take_profit_1 TEXT,
  take_profit_2 TEXT,
  risk_reward TEXT,
  size TEXT,
  decisione_agente TEXT,
  decisione_trader TEXT,
  esito TEXT,
  durata_trade TEXT,
  nota TEXT,
  screenshot_link TEXT,
  csv_row TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_journal_session ON journal_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_created ON journal_entries(created_at);
