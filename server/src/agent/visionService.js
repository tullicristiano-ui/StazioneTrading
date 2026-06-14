import fs from 'fs/promises'
import crypto from 'crypto'

const OLLAMA_URL = () => process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = () => process.env.OLLAMA_VISION_MODEL || 'qwen2.5vl:3b'
const VISION_TIMEOUT_MS = () => parseInt(process.env.VISION_TIMEOUT_MS || '60000', 10)

const VISION_PROMPT =
  'Descrivi in max 120 parole SOLO ciò che vedi nel grafico. ' +
  'Elenca in punti (se visibili): timeframe, trend, swing high/low, zone/livelli evidenziati, pattern. ' +
  'Ometti qualsiasi voce non visibile. Nessun segnale operativo, nessuna previsione.'

// Cache in memoria: chiave = SHA-256 del file, valore = { description, timestamp }
const descriptionCache = new Map()

export function isVisionLocalEnabled() {
  return process.env.VISION_LOCAL_ENABLED === 'true'
}

/**
 * Controlla se Ollama è raggiungibile e se il modello Vision è presente.
 * Ritorna { reachable: bool, modelPresent: bool }
 */
export async function isOllamaReachable() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 2000)

  try {
    const res = await fetch(`${OLLAMA_URL()}/api/tags`, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) return { reachable: false, modelPresent: false }

    const data = await res.json()
    const models = Array.isArray(data.models) ? data.models : []
    const targetModel = OLLAMA_MODEL().toLowerCase()
    const modelPresent = models.some((m) => {
      const name = (m.name || '').toLowerCase()
      return name === targetModel || name.startsWith(targetModel.split(':')[0])
    })

    return { reachable: true, modelPresent }
  } catch {
    clearTimeout(timer)
    return { reachable: false, modelPresent: false }
  }
}

function fileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

/**
 * Descrive una lista di immagini tramite Ollama.
 * images = [{ localPath, fileName, sizeBytes, uploadedAt }]
 *
 * Ritorna lista di { ok, fileName, text }
 * In caso di errore per singola immagine: ok=false, text=''
 * Non lancia mai eccezioni bloccanti.
 */
export async function describeImages(images) {
  const results = []

  for (const img of images) {
    let buffer
    try {
      buffer = await fs.readFile(img.localPath)
    } catch (err) {
      console.warn(`visionService: impossibile leggere file ${img.fileName}:`, err.message)
      results.push({ ok: false, fileName: img.fileName, text: '' })
      continue
    }

    const hash = fileHash(buffer)

    if (descriptionCache.has(hash)) {
      console.log(`visionService: cache hit per ${img.fileName}`)
      const cached = descriptionCache.get(hash)
      const sizeKB = Math.round((img.sizeBytes || buffer.length) / 1024)
      const header = `[Immagine: ${img.fileName} · ${sizeKB} KB · caricata ${img.uploadedAt}]`
      results.push({ ok: true, fileName: img.fileName, text: `${header}\n${cached.description}` })
      continue
    }

    const base64 = buffer.toString('base64')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS())

    try {
      const res = await fetch(`${OLLAMA_URL()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL(),
          messages: [{ role: 'user', content: VISION_PROMPT, images: [base64] }],
          stream: false,
          keep_alive: '10m',
          options: { num_predict: 200 }
        }),
        signal: controller.signal
      })

      clearTimeout(timer)

      if (!res.ok) {
        console.warn(`visionService: Ollama HTTP ${res.status} per ${img.fileName}`)
        results.push({ ok: false, fileName: img.fileName, text: '' })
        continue
      }

      const data = await res.json()
      const description = data?.message?.content?.trim() || ''

      if (!description) {
        console.warn(`visionService: risposta vuota da Ollama per ${img.fileName}`)
        results.push({ ok: false, fileName: img.fileName, text: '' })
        continue
      }

      descriptionCache.set(hash, { description, timestamp: Date.now() })
      console.log(`visionService: descrizione ottenuta per ${img.fileName}`)

      const sizeKB = Math.round((img.sizeBytes || buffer.length) / 1024)
      const header = `[Immagine: ${img.fileName} · ${sizeKB} KB · caricata ${img.uploadedAt}]`
      results.push({ ok: true, fileName: img.fileName, text: `${header}\n${description}` })
    } catch (err) {
      clearTimeout(timer)
      console.warn(`visionService: errore chiamata Ollama per ${img.fileName}:`, err.message)
      results.push({ ok: false, fileName: img.fileName, text: '' })
    }
  }

  return results
}
