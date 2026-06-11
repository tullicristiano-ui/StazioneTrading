import sqlite3 from 'sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '..', '..', 'data', 'aware_trading.db')

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

let db = null

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err)
        reject(err)
        return
      }

      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Failed to enable foreign keys:', err)
          reject(err)
          return
        }

        // Run migrations
        runMigrations()
          .then(() => {
            console.log('✓ Database initialized successfully')
            resolve(db)
          })
          .catch(reject)
      })
    })
  })
}

function execAsync(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

/**
 * Applica in ordine tutti i file .sql presenti in /migrations.
 * Tiene traccia delle migrazioni già applicate nella tabella
 * schema_migrations, così ogni file viene eseguito una sola volta.
 */
async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations')

  // Tabella di controllo delle migrazioni applicate
  await execAsync(
    'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)'
  )

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const already = await getAsync('SELECT name FROM schema_migrations WHERE name = ?', [file])
    if (already) {
      continue
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    try {
      await execAsync(sql)
      await runAsync(
        'INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)',
        [file, new Date().toISOString()]
      )
      console.log(`✓ Migrazione applicata: ${file}`)
    } catch (err) {
      console.error(`Migration error in ${file}:`, err)
      throw err
    }
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows || [])
    })
  })
}

export function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    } else {
      resolve()
    }
  })
}
