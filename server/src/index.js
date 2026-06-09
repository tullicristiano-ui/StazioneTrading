import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { initDatabase } from './db/database.js'

// Load environment variables
dotenv.config({ path: '../.env' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const UPLOADS_PATH = process.env.UPLOADS_PATH || './server/uploads'

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_PATH))

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = req.body.session_id
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Import routes (will be created)
// import sessionsRouter from './routes/sessions.js'
// import messagesRouter from './routes/messages.js'
// import agentRouter from './routes/agent.js'
// import journalRouter from './routes/journal.js'

// app.use('/api/sessions', sessionsRouter)
// app.use('/api/messages', messagesRouter)
// app.use('/api/agent', agentRouter)
// app.use('/api/journal', journalRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Start server
async function startServer() {
  try {
    // Initialize database
    await initDatabase()
    console.log('✓ Database initialized')

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🎯 Aware Trading Server running on http://localhost:${PORT}`)
      console.log(`📁 Uploads path: ${UPLOADS_PATH}`)
      console.log(`Health check: http://localhost:${PORT}/health\n`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
