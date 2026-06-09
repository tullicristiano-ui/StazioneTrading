import { allQuery } from '../db/database.js'
import { loadSkillPrompt } from './skillLoader.js'
import { buildMessages } from './promptBuilder.js'
import { requestCompletion, parseCompletionResponse } from './providerClient.js'

export async function runAnalysis({ sessionId, content, screenshots = [] }) {
  const systemPrompt = await loadSkillPrompt()

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
    return assistantText || `Agente Aware: ho elaborato la richiesta, ma non sono riuscito a ottenere una risposta valida dal provider.`
  } catch (err) {
    console.error('orchestrator: errore OpenRouter', err.message)
    return `Agente Aware: si è verificato un errore durante l'elaborazione della richiesta. Dettagli: ${err.message}`
  }
}
