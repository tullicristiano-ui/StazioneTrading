import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { initDatabase } from './db/database.js'
import { isVisionLocalEnabled } from './agent/visionService.js'
import sessionsRouter from './routes/sessions.js'
import messagesRouter from './routes/messages.js'
import agentRouter from './routes/agent.js'
import journalRouter from './routes/journal.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')
const envPath = fs.existsSync(path.join(repoRoot, '.env'))
  ? path.join(repoRoot, '.env')
  : fs.existsSync(path.join(repoRoot, '.env.local'))
    ? path.join(repoRoot, '.env.local')
    : undefined

if (envPath) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

const PORT = process.env.PORT || 3001
const UPLOADS_PATH = process.env.UPLOADS_PATH || path.resolve(__dirname, 'uploads')

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use('/uploads', express.static(UPLOADS_PATH))

app.use('/api/sessions', sessionsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/agent', agentRouter)
app.use('/api/journal', journalRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

async function warmUpVisionModel() {
  if (!isVisionLocalEnabled()) return
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
  const model = process.env.OLLAMA_VISION_MODEL || 'qwen2.5vl:3b'
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: 'ok' }], stream: false, keep_alive: '10m', options: { num_predict: 1 } }),
      signal: controller.signal
    })
    clearTimeout(timer)
    console.log(`✓ Vision model pre-loaded (${model})`)
  } catch {
    // Ollama non disponibile - non bloccante
  }
}

async function startServer() {
  try {
    await initDatabase()
    console.log('✓ Database initialized')

    app.listen(PORT, () => {
      console.log(`\n✓ Aware Trading Server running on http://localhost:${PORT}`)
      console.log(`✓ Uploads path: ${UPLOADS_PATH}`)
      console.log(`Health check: http://localhost:${PORT}/health\n`)
      warmUpVisionModel()
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
