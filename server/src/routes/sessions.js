import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery, allQuery } from '../db/database.js'
import { generateSessionSummary } from '../agent/orchestrator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const router = express.Router()

const now = () => new Date().toISOString()

router.post('/', async (req, res, next) => {
  try {
    const { asset = null, status = 'active', title = null } = req.body
    const id = uuidv4()
    const timestamp = now()

    await runQuery(
      'INSERT INTO sessions (id, created_at, updated_at, asset, status, title) VALUES (?, ?, ?, ?, ?, ?)',
      [id, timestamp, timestamp, asset, status, title]
    )

    await runQuery(
      'INSERT INTO session_memory (id, session_id, asset, timeframes, structure, levels, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), id, asset, null, null, null, null, timestamp]
    )

    res.status(201).json({ id, created_at: timestamp, updated_at: timestamp, asset, status, title })
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const sessions = await allQuery('SELECT * FROM sessions ORDER BY updated_at DESC')
    res.json(sessions)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const session = await getQuery('SELECT * FROM sessions WHERE id = ?', [id])

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const messages = await allQuery(
      'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC',
      [id]
    )

    const parsedMessages = messages.map((message) => {
      if (message.screenshots) {
        try {
          return { ...message, screenshots: JSON.parse(message.screenshots) }
        } catch {
          return { ...message, screenshots: [] }
        }
      }
      return { ...message, screenshots: [] }
    })

    const sessionMemory = await getQuery(
      'SELECT * FROM session_memory WHERE session_id = ?',
      [id]
    )

    res.json({ session, messages: parsedMessages, session_memory: sessionMemory })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { asset, status, title } = req.body
    const session = await getQuery('SELECT * FROM sessions WHERE id = ?', [id])

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    await runQuery(
      'UPDATE sessions SET asset = ?, status = ?, title = ? WHERE id = ?',
      [asset ?? session.asset, status ?? session.status, title ?? session.title, id]
    )

    if (asset && asset !== session.asset) {
      await runQuery(
        'UPDATE session_memory SET asset = ? WHERE session_id = ?',
        [asset, id]
      )
    }

    const updatedSession = await getQuery('SELECT * FROM sessions WHERE id = ?', [id])
    res.json(updatedSession)
  } catch (err) {
    next(err)
  }
})

// F3-A-04 — Chiudi sessione: imposta status="closed", genera un riassunto AI
// e lo salva nel campo sessions.summary.
router.post('/:id/close', async (req, res, next) => {
  try {
    const { id } = req.params
    const session = await getQuery('SELECT * FROM sessions WHERE id = ?', [id])

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    if (session.status === 'closed') {
      return res.status(400).json({ error: 'La sessione è già chiusa' })
    }

    // Genera il riassunto (funzione robusta: non lancia, ritorna sempre stringa)
    const summary = await generateSessionSummary({ sessionId: id })

    const closedAt = now()
    await runQuery(
      'UPDATE sessions SET status = ?, summary = ?, closed_at = ?, updated_at = ? WHERE id = ?',
      ['closed', summary, closedAt, closedAt, id]
    )

    const updatedSession = await getQuery('SELECT * FROM sessions WHERE id = ?', [id])
    res.json(updatedSession)
  } catch (err) {
    next(err)
  }
})

// F3-A-05 — Snapshot analisi: salva lo stato corrente della sessione
// (session memory + messaggi) come snapshot nominabile.
router.post('/:id/snapshots', async (req, res, next) => {
  try {
    const { id } = req.params
    const rawName = (req.body && req.body.name) || ''
    const name = String(rawName).trim()

    if (!name) {
      return res.status(400).json({ error: 'Il nome dello snapshot è obbligatorio' })
    }

    const session = await getQuery('SELECT * FROM sessions WHERE id = ?', [id])
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const sessionMemory = await getQuery('SELECT * FROM session_memory WHERE session_id = ?', [id])
    const messages = await allQuery(
      'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC',
      [id]
    )

    const snapshotId = uuidv4()
    const createdAt = now()

    await runQuery(
      'INSERT INTO snapshots (id, session_id, created_at, name, asset, status, memory_json, messages_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        snapshotId,
        id,
        createdAt,
        name,
        session.asset,
        session.status,
        JSON.stringify(sessionMemory || null),
        JSON.stringify(messages || [])
      ]
    )

    res.status(201).json({
      id: snapshotId,
      session_id: id,
      created_at: createdAt,
      name,
      asset: session.asset,
      status: session.status
    })
  } catch (err) {
    next(err)
  }
})

// Elenco snapshot di una sessione (metadati, senza il contenuto JSON pesante).
router.get('/:id/snapshots', async (req, res, next) => {
  try {
    const { id } = req.params
    const session = await getQuery('SELECT * FROM sessions WHERE id = ?', [id])
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const snapshots = await allQuery(
      'SELECT id, session_id, created_at, name, asset, status FROM snapshots WHERE session_id = ? ORDER BY created_at DESC',
      [id]
    )
    res.json(snapshots)
  } catch (err) {
    next(err)
  }
})

// Apertura snapshot: ritorna lo snapshot completo con memory_json e
// messages_json già parsati in JSON. Solo visualizzazione (sola lettura),
// nessun ripristino distruttivo.
router.get('/:id/snapshots/:snapshotId', async (req, res, next) => {
  try {
    const { id, snapshotId } = req.params

    const snapshot = await getQuery(
      'SELECT * FROM snapshots WHERE id = ? AND session_id = ?',
      [snapshotId, id]
    )

    if (!snapshot) {
      return res.status(404).json({ error: 'Snapshot not found' })
    }

    let memory = null
    try {
      memory = snapshot.memory_json ? JSON.parse(snapshot.memory_json) : null
    } catch {
      memory = null
    }

    let messages = []
    try {
      const parsed = snapshot.messages_json ? JSON.parse(snapshot.messages_json) : []
      messages = Array.isArray(parsed) ? parsed : []
    } catch {
      messages = []
    }

    // Normalizza gli screenshot dei messaggi (salvati come stringa JSON nel DB)
    const parsedMessages = messages.map((message) => {
      if (message && typeof message.screenshots === 'string') {
        try {
          return { ...message, screenshots: JSON.parse(message.screenshots) }
        } catch {
          return { ...message, screenshots: [] }
        }
      }
      if (message && Array.isArray(message.screenshots)) {
        return message
      }
      return { ...message, screenshots: [] }
    })

    res.json({
      id: snapshot.id,
      session_id: snapshot.session_id,
      created_at: snapshot.created_at,
      name: snapshot.name,
      asset: snapshot.asset,
      status: snapshot.status,
      memory,
      messages: parsedMessages
    })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const session = await getQuery('SELECT * FROM sessions WHERE id = ?', [id])

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    await runQuery('DELETE FROM journal_entries WHERE session_id = ?', [id])
    await runQuery('DELETE FROM snapshots WHERE session_id = ?', [id])
    await runQuery('DELETE FROM messages WHERE session_id = ?', [id])
    await runQuery('DELETE FROM session_memory WHERE session_id = ?', [id])
    await runQuery('DELETE FROM sessions WHERE id = ?', [id])

    const uploadsDir = process.env.UPLOADS_PATH
      ? path.resolve(process.env.UPLOADS_PATH, id)
      : path.resolve(__dirname, '..', 'uploads', id)

    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true, force: true })
    }

    res.json({ ok: true, id })
  } catch (err) {
    next(err)
  }
})

export default router
