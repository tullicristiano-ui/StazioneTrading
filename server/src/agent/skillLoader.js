import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const kitPath = path.resolve(__dirname, '..', '..', 'kit')
let cache = null

export async function loadSkillPrompt() {
  if (cache) {
    return cache
  }

  try {
    const files = await fs.readdir(kitPath)
    const markdownFiles = files.filter((file) => file.toLowerCase().endsWith('.md')).sort()

    const contents = []
    for (const file of markdownFiles) {
      const text = await fs.readFile(path.join(kitPath, file), 'utf8')
      contents.push(`--- ${file} ---\n${text.trim()}`)
    }

    cache = contents.join('\n\n')
    return cache
  } catch (error) {
    console.warn('skillLoader: impossibile caricare i file kit', error.message)
    return 'You are an Aware Trading assistant. Provide structured analysis without giving financial advice.'
  }
}
