import { allQuery, runQuery } from '../db/database.js'
import { loadSkillPrompt } from './skillLoader.js'
import { buildMessages } from './promptBuilder.js'
import { requestCompletion, parseCompletionResponse } from './providerClient.js'

function normalizeText(value) {
  if (!value || typeof value !== 'string') return null
  const text = value.trim()
  return text.length > 0 ? text : null
}

function extractSection(pattern, text) {
  const match = text.match(pattern)
  return match ? normalizeText(match[1]) : null
}

function parseSessionMemory(text) {
  const content = text || ''
  const asset = extractSection(/(?:Asset|asset)\s*[:\-–]\s*(.+)/i, content)
  const timeframes = extractSection(/(?:Timeframes|Timeframe|TF)\s*[:\-–]\s*(.+)/i, content)
  const structure = extractSection(/(?:Structure|Struttura)\s*[:\-–]\s*([\s\S]+?)(?=(?:\n(?:Levels|Livelli|Notes|Note|Asset|Timeframes|Timeframe|TF)\s*[:\-–])|$)/i, content)
  const levels = extractSection(/(?:Levels|Livelli)\s*[:\-–]\s*([\s\S]+?)(?=(?:\n(?:Notes|Note|Asset|Timeframes|Timeframe|TF|Structure|Struttura)\s*[:\-–])|$)/i, content)
  const notes = extractSection(/(?:Notes|Note)\s*[:\-–]\s*([\s\S]+?)(?=(?:\n(?:Asset|Timeframes|Timeframe|TF|Structure|Struttura|Levels|Livelli)\s*[:\-–])|$)/i, content)

  return { asset, timeframes, structure, levels, notes }
}

const now = () => new Date().toISOString()

export async function runAnalysis({ sessionId, content, screenshots = [], analysisMode = 'standard', journalMode = false }) {
  let systemPrompt = await loadSkillPrompt()

  if (analysisMode === 'trade_open') {
    systemPrompt += '\n\nModalità "trade aperto": rispondi mantenendo il focus su un trade già aperto, enfatizzando livelli chiave, gestione del rischio, aree di supporto/resistenza e aggiornamenti operativi. Usa il formato e il linguaggio del kit Aware Trader senza generare segnali di trading.'
  }

  if (journalMode) {
    systemPrompt += '\n\nObiettivo: genera esclusivamente una singola riga CSV per una voce journal. Rispondi con la riga CSV completa, senza testo aggiuntivo, e includi tutti i campi previsti dal journal.'
  }

  let history = []
  try {
    history = await allQuery(
      'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    )
  } catch (err) {
    console.warn('orchestrator: impossibile caricare cronologia messaggi', err.message)
  }

  const messages = await buildMessages(systemPrompt, history, content, screenshots)

  if (!process.env.OPENROUTER_API_KEY) {
    return `Agente Aware: non è configurata la chiave OPENROUTER_API_KEY. Il messaggio ricevuto è:\n\n${content}`
  }

  try {
    const payload = {
      model: 'anthropic/claude-3.5-sonnet',
      messages,
      temperature: 0.3,
      max_tokens: 600
    }

    const response = await requestCompletion(payload)
    const assistantText = parseCompletionResponse(response)
    const finalText = assistantText || `Agente Aware: ho elaborato la richiesta, ma non sono riuscito a ottenere una risposta valida dal provider.`

    const memory = parseSessionMemory(finalText)
    if (Object.values(memory).some((value) => value)) {
      await runQuery(
        'UPDATE session_memory SET asset = ?, timeframes = ?, structure = ?, levels = ?, notes = ?, updated_at = ? WHERE session_id = ?',
        [memory.asset, memory.timeframes, memory.structure, memory.levels, memory.notes, now(), sessionId]
      )
      await runQuery('UPDATE sessions SET updated_at = ? WHERE id = ?', [now(), sessionId])
    }

    return finalText
  } catch (err) {
    console.error('orchestrator: errore OpenRouter', err.message)
    return `Agente Aware: si è verificato un errore durante l'elaborazione della richiesta. Dettagli: ${err.message}`
  }
}
