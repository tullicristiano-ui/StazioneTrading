import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsRoot = path.resolve(__dirname, '..', '..', 'uploads')

function toDataUrl(filePath) {
  return fs.readFile(filePath)
    .then((buffer) => {
      const ext = path.extname(filePath).toLowerCase().replace('.', '')
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'application/octet-stream'
      return `data:${mime};base64,${buffer.toString('base64')}`
    })
}

export async function buildMessages(systemPrompt, history = [], userContent = '', screenshotUrls = []) {
  const messages = [{ role: 'system', content: systemPrompt }]

  for (const message of history) {
    messages.push({
      role: message.role,
      content: message.content
    })
  }

  // Costruisce i blocchi immagine (data URL base64) dagli screenshot allegati.
  const imageBlocks = []
  for (const url of screenshotUrls) {
    const localPath = url.startsWith('/uploads/')
      ? path.join(uploadsRoot, url.replace('/uploads/', ''))
      : null

    if (localPath) {
      try {
        const dataUrl = await toDataUrl(localPath)
        imageBlocks.push({ type: 'image_url', image_url: { url: dataUrl } })
      } catch (error) {
        console.warn('promptBuilder: impossibile leggere immagine', localPath, error.message)
      }
    }
  }

  if (imageBlocks.length > 0) {
    // Formato corretto per i provider con vision (OpenRouter, futuro Anthropic):
    // UN SOLO messaggio user con content = array di blocchi [testo, immagine, ...].
    // I provider text-only (HuggingFace/Gemma) ricevono lo stesso array e lo
    // appiattiscono a testo nel loro adapter (normalizeMessagesForTextModel).
    const text = userContent && userContent.trim().length > 0
      ? userContent
      : 'Analizza gli screenshot allegati applicando il metodo Aware Trader.'

    const contentBlocks = [{ type: 'text', text }]
    imageBlocks.forEach((block) => contentBlocks.push(block))
    messages.push({ role: 'user', content: contentBlocks })
  } else {
    messages.push({ role: 'user', content: userContent })
  }

  return messages
}
