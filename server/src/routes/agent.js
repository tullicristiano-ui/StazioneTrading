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

function parseCsvLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  fields.push(current.trim())
  return fields
}

function findCandidateCsvLine(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.find((line) => {
    const fields = parseCsvLine(line)
    return fields.length >= 6 && line.includes(',')
  }) || null
}

function parseJournalCsv(text) {
  const csvLine = findCandidateCsvLine(text)
  if (!csvLine) {
    return null
  }

  const fields = parseCsvLine(csvLine)
  const columns = [
    'data',
    'ora',
    'asset',
    'timeframe',
    'bias',
    'setup',
    'modalita',
    'entry',
    'stop_loss',
    'take_profit_1',
    'take_profit_2',
    'risk_reward',
    'size',
    'decisione_agente',
    'decisione_trader',
    'esito',
    'durata_trade',
    'nota',
    'screenshot_link'
  ]

  if (fields.length < 5) {
    return null
  }

  const row = {}
  columns.forEach((column, index) => {
    row[column] = fields[index] ?? null
  })
  row.csv_row = csvLine
  return row
}

router.post('/analyze', upload.array('screenshots'), async (req, res, next) => {
  try {
    const { session_id: sessionId, content } = req.body
    const analysisMode = req.body.analysis_mode || 'standard'
    const journalMode = req.body.journal_mode === 'true' || req.body.journal_mode === true

    if (!sessionId || (!content && !journalMode)) {
      return res.status(400).json({ error: 'session_id and content are required unless journal_mode is enabled' })
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
    const analysisContent = content || (journalMode ? 'Genera una riga journal in formato CSV basata sulle ultime informazioni della sessione.' : '')

    await runQuery(
      'INSERT INTO messages (id, session_id, created_at, role, content, screenshots) VALUES (?, ?, ?, ?, ?, ?)',
      [userMessageId, sessionId, userTimestamp, 'user', analysisContent, JSON.stringify(screenshotUrls)]
    )

    const assistantText = await runAnalysis({
      sessionId,
      content: analysisContent,
      screenshots: screenshotUrls,
      analysisMode,
      journalMode
    })

    const assistantMessageId = uuidv4()
    const assistantTimestamp = now()

    await runQuery(
      'INSERT INTO messages (id, session_id, created_at, role, content, screenshots) VALUES (?, ?, ?, ?, ?, ?)',
      [assistantMessageId, sessionId, assistantTimestamp, 'assistant', assistantText, JSON.stringify([])]
    )

    let journalEntry = null
    if (journalMode) {
      const parsed = parseJournalCsv(assistantText)
      if (parsed) {
        const journalId = uuidv4()
        const journalCreatedAt = now()
        const params = [
          journalId,
          sessionId,
          journalCreatedAt,
          parsed.data,
          parsed.ora,
          parsed.asset,
          parsed.timeframe,
          parsed.bias,
          parsed.setup,
          parsed.modalita,
          parsed.entry,
          parsed.stop_loss,
          parsed.take_profit_1,
          parsed.take_profit_2,
          parsed.risk_reward,
          parsed.size,
          parsed.decisione_agente,
          parsed.decisione_trader,
          parsed.esito,
          parsed.durata_trade,
          parsed.nota,
          parsed.screenshot_link,
          parsed.csv_row
        ]

        await runQuery(
          'INSERT INTO journal_entries (id, session_id, created_at, data, ora, asset, timeframe, bias, setup, modalita, entry, stop_loss, take_profit_1, take_profit_2, risk_reward, size, decisione_agente, decisione_trader, esito, durata_trade, nota, screenshot_link, csv_row) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        )

        journalEntry = { id: journalId, session_id: sessionId, created_at: journalCreatedAt, ...parsed }
      }
    }

    await runQuery('UPDATE sessions SET updated_at = ? WHERE id = ?', [assistantTimestamp, sessionId])

    const sessionMemory = await getQuery('SELECT * FROM session_memory WHERE session_id = ?', [sessionId])

    res.status(201).json({
      userMessage: {
        id: userMessageId,
        session_id: sessionId,
        created_at: userTimestamp,
        role: 'user',
        content: content || '',
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
      session_memory: sessionMemory,
      journalEntry
    })
  } catch (err) {
    next(err)
  }
})

export default router
