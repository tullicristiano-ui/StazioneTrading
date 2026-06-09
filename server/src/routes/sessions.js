import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery, allQuery } from '../db/database.js'

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

    const updatedAt = now()
    await runQuery(
      'UPDATE sessions SET asset = ?, status = ?, title = ?, updated_at = ? WHERE id = ?',
      [asset ?? session.asset, status ?? session.status, title ?? session.title, updatedAt, id]
    )

    const updatedSession = await getQuery('SELECT * FROM sessions WHERE id = ?', [id])
    res.json(updatedSession)
  } catch (err) {
    next(err)
  }
})

export default router
