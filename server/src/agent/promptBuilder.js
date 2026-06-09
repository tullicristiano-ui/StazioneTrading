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

  if (screenshotUrls.length > 0) {
    const imageBlocks = []
    for (const url of screenshotUrls) {
      const localPath = url.startsWith('/uploads/')
        ? path.join(uploadsRoot, url.replace('/uploads/', ''))
        : null

      if (localPath) {
        try {
          const dataUrl = await toDataUrl(localPath)
          imageBlocks.push({
            type: 'image_url',
            image_url: { url: dataUrl },
            caption: 'Screenshot allegato'
          })
        } catch (error) {
          console.warn('promptBuilder: impossibile leggere immagine', localPath, error.message)
        }
      }
    }

    if (imageBlocks.length > 0) {
      messages.push({
        role: 'user',
        content: `Allego ${imageBlocks.length} screenshot per analizzare la struttura del mercato.`
      })
      imageBlocks.forEach((block) => messages.push(block))
    }
  }

  messages.push({ role: 'user', content: userContent })
  return messages
}
