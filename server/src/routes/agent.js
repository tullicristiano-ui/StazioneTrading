import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery } from '../db/database.js'
import { runAnalysis } from '../agent/orchestrator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()

const UPLOADS_PATH = process.env.UPLOADS_PATH || path.resolve(__dirname, '..', 'uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = req.body.session_id
    if (!sessionId) {
      return cb(new Error('Missing session_id'), null)
    }

    const dir = path.join(UPLOADS_PATH, sessionId)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/png', 'image/jpeg', 'image/webp']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PNG, JPEG, and WebP are allowed.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
})

const now = () => new Date().toISOString()

router.post('/analyze', upload.array('screenshots'), async (req, res, next) => {
  try {
    const { session_id: sessionId, content } = req.body

    if (!sessionId || !content) {
      return res.status(400).json({ error: 'session_id and content are required' })
    }

    const session = await getQuery('SELECT * FROM sessions WHERE id = ?', [sessionId])
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const screenshotUrls = (req.files || []).map((file) => {
      return `/uploads/${sessionId}/${path.basename(file.filename)}`
    })

    const userMessageId = uuidv4()
    const userTimestamp = now()

    await runQuery(
      'INSERT INTO messages (id, session_id, created_at, role, content, screenshots) VALUES (?, ?, ?, ?, ?, ?)',
      [userMessageId, sessionId, userTimestamp, 'user', content, JSON.stringify(screenshotUrls)]
    )

    const assistantText = await runAnalysis({ sessionId, content, screenshots: screenshotUrls })
    const assistantMessageId = uuidv4()
    const assistantTimestamp = now()

    await runQuery(
      'INSERT INTO messages (id, session_id, created_at, role, content, screenshots) VALUES (?, ?, ?, ?, ?, ?)',
      [assistantMessageId, sessionId, assistantTimestamp, 'assistant', assistantText, JSON.stringify([])]
    )

    await runQuery('UPDATE sessions SET updated_at = ? WHERE id = ?', [assistantTimestamp, sessionId])

    const sessionMemory = await getQuery('SELECT * FROM session_memory WHERE session_id = ?', [sessionId])

    res.status(201).json({
      userMessage: {
        id: userMessageId,
        session_id: sessionId,
        created_at: userTimestamp,
        role: 'user',
        content,
        screenshots: screenshotUrls
      },
      assistantMessage: {
        id: assistantMessageId,
        session_id: sessionId,
        created_at: assistantTimestamp,
        role: 'assistant',
        content: assistantText,
        screenshots: []
      },
      session_memory: sessionMemory
    })
  } catch (err) {
    next(err)
  }
})

export default router
