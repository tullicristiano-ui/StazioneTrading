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

function runMigrations() {
  return new Promise((resolve, reject) => {
    const migrationPath = path.join(__dirname, 'migrations', '001_init.sql')

    fs.readFile(migrationPath, 'utf8', (err, sql) => {
      if (err) {
        console.error('Failed to read migration file:', err)
        reject(err)
        return
      }

      db.exec(sql, (err) => {
        if (err) {
          console.error('Migration error:', err)
          reject(err)
          return
        }

        resolve()
      })
    })
  })
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
