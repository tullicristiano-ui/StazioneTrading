import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import { allQuery, runQuery } from '../db/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsRoot = path.resolve(__dirname, '..', 'uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = req.body.session_id
    if (!sessionId) {
      return cb(new Error('Missing session_id'), null)
    }

    const dir = path.join(uploadsRoot, sessionId)
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

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const sessionId = req.query.session_id
    const query = sessionId
      ? 'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC'
      : 'SELECT * FROM messages ORDER BY created_at ASC'
    const params = sessionId ? [sessionId] : []
    const messages = await allQuery(query, params)

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

    res.json(parsedMessages)
  } catch (err) {
    next(err)
  }
})

router.post('/', upload.array('screenshots'), async (req, res, next) => {
  try {
    const { session_id: sessionId, content, role = 'user' } = req.body
    if (!sessionId || !content) {
      return res.status(400).json({ error: 'session_id and content are required' })
    }

    const screenshotUrls = (req.files || []).map((file) => `/uploads/${path.basename(path.dirname(file.path))}/${path.basename(file.filename)}`)
    const messageId = uuidv4()
    const timestamp = new Date().toISOString()

    await runQuery(
      'INSERT INTO messages (id, session_id, created_at, role, content, screenshots) VALUES (?, ?, ?, ?, ?, ?)',
      [messageId, sessionId, timestamp, role, content, JSON.stringify(screenshotUrls)]
    )

    res.status(201).json({
      id: messageId,
      session_id: sessionId,
      created_at: timestamp,
      role,
      content,
      screenshots: screenshotUrls
    })
  } catch (err) {
    next(err)
  }
})

export default router
