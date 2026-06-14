import { allQuery, runQuery, getQuery } from '../db/database.js'
import { loadSkillPrompt } from './skillLoader.js'
import { buildMessages } from './promptBuilder.js'
import { requestCompletion, parseCompletionResponse, getActiveProvider } from './providerClient.js'

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

  let sessionMemory = null
  try {
    sessionMemory = await getQuery('SELECT * FROM session_memory WHERE session_id = ?', [sessionId])
  } catch (err) {
    console.warn('orchestrator: impossibile caricare session_memory', err.message)
  }

  // F2-A — Se la richiesta di analisi non ha screenshot allegati (in modalità
  // standard o new_analysis), guida l'agente a chiedere educatamente lo
  // screenshot del grafico prima di procedere con l'analisi vera e propria.
  const hasScreenshots = Array.isArray(screenshots) && screenshots.length > 0
  if (!hasScreenshots && !journalMode && (analysisMode === 'standard' || analysisMode === 'new_analysis')) {
    systemPrompt += '\n\nNessuno screenshot del grafico è stato allegato a questa richiesta. Prima di procedere con l\'analisi della struttura di mercato, chiedi al trader in modo cortese di caricare lo screenshot del grafico, specificando che servono sia il timeframe di contesto (es. D1, H4) sia il timeframe decisionale (es. 15m, 5m). Mantieni il tono e il linguaggio del kit Aware Trader e non formulare valutazioni dettagliate finché non disponi dell\'immagine.'
  }

  // Special handling for a "new_analysis" flow: ask for context TF then decision TF
  if (analysisMode === 'new_analysis') {
    if (!sessionMemory || !sessionMemory.timeframes) {
      systemPrompt += '\n\nModalità "Nuova analisi": prima di fornire valutazioni, poni queste domande al trader e attendi le risposte:\n1) "Quale timeframe di contesto stai considerando? (es. D1, H4)"\n2) "Qual è il timeframe decisionale? (es. 15m, 5m)"\nNon procedere con l\'analisi principale finché non ricevi entrambe le risposte.'
    } else {
      systemPrompt += '\n\nModalità "Nuova analisi": il session memory indica timeframes; se manca il timeframe decisionale, chiedilo esplicitamente prima di procedere.'
    }
  }

  const messages = await buildMessages(systemPrompt, history, content, screenshots)

  const activeProvider = getActiveProvider()
  if (activeProvider === 'openrouter' && !process.env.OPENROUTER_API_KEY) {
    return `Agente Aware: non è configurata la chiave OPENROUTER_API_KEY. Il messaggio ricevuto è:\n\n${content}`
  }

  try {
    const payload = {
      model: 'anthropic/claude-3.5-sonnet',
      messages,
      temperature: 0.3,
      max_tokens: 1500
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

/**
 * Genera un riassunto testuale della sessione riusando il provider AI attivo.
 * Usato alla chiusura della sessione (F3-A-04).
 *
 * Restituisce sempre una stringa: in caso di provider non configurato o
 * errore, restituisce un fallback testuale (non lancia eccezioni), così
 * la chiusura della sessione non si blocca mai.
 */
export async function generateSessionSummary({ sessionId }) {
  let history = []
  try {
    history = await allQuery(
      'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    )
  } catch (err) {
    console.warn('orchestrator: impossibile caricare cronologia per riassunto', err.message)
  }

  if (!history || history.length === 0) {
    return 'Sessione chiusa senza messaggi: nessun contenuto da riassumere.'
  }

  const activeProvider = getActiveProvider()
  if (activeProvider === 'openrouter' && !process.env.OPENROUTER_API_KEY) {
    return 'Riassunto non disponibile: la chiave OPENROUTER_API_KEY non è configurata.'
  }

  // Costruisce un testo leggibile della conversazione (solo testo, niente immagini)
  const transcript = history
    .map((m) => `${m.role === 'user' ? 'Trader' : 'Agente'}: ${m.content}`)
    .join('\n\n')

  const summarySystem =
    'Sei l\'assistente Aware Trader. Riassumi in italiano, in modo chiaro e sintetico, ' +
    'la sessione di analisi che segue. Evidenzia: asset analizzato, timeframe considerati, ' +
    'struttura di mercato individuata, livelli chiave e conclusioni principali. ' +
    'Non fornire segnali operativi né consigli finanziari. Massimo 8 righe.'

  const messages = [
    { role: 'system', content: summarySystem },
    { role: 'user', content: `Ecco la conversazione della sessione da riassumere:\n\n${transcript}` }
  ]

  try {
    const payload = {
      model: 'anthropic/claude-3.5-sonnet',
      messages,
      temperature: 0.3,
      max_tokens: 400
    }

    const response = await requestCompletion(payload)
    const summaryText = parseCompletionResponse(response)
    return summaryText || 'Riassunto non disponibile: il provider non ha restituito una risposta valida.'
  } catch (err) {
    console.error('orchestrator: errore generazione riassunto', err.message)
    return `Riassunto non disponibile a causa di un errore: ${err.message}`
  }
}
