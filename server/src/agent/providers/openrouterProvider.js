/**
 * OpenRouter Provider Adapter
 *
 * Wraps the OpenRouter /v1/chat/completions API.
 * Supports vision (image_url blocks) and multimodal models.
 * Il model viene letto dal payload (impostato dall'orchestrator)
 * oppure da OPENROUTER_MODEL come fallback.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (process.env.OPENROUTER_API_KEY) {
    headers.Authorization = `Bearer ${process.env.OPENROUTER_API_KEY}`
  }
  headers['HTTP-Referer'] = process.env.HTTP_REFERER || 'http://localhost:3001'
  headers['X-Title'] = process.env.X_TITLE || 'Aware Trading Workspace'
  return headers
}

export async function requestCompletion(payload) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY')
  }

  // Permette override del modello via env senza toccare l'orchestrator
  const enrichedPayload = {
    ...payload,
    model: process.env.OPENROUTER_MODEL || payload.model || 'anthropic/claude-3.5-sonnet'
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(enrichedPayload)
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenRouter error ${response.status}: ${body}`)
  }

  return response.json()
}

export function parseResponse(data) {
  if (!data) return null

  // Percorso alternativo usato da alcuni modelli via OpenRouter
  const outputText = data.output_text
  if (typeof outputText === 'string' && outputText.length > 0) {
    return outputText.trim()
  }

  const choiceText = data?.choices?.[0]?.message?.content
  if (typeof choiceText === 'string' && choiceText.length > 0) {
    return choiceText.trim()
  }

  if (Array.isArray(choiceText)) {
    return choiceText.map((block) => block?.text || '').join(' ').trim()
  }

  return null
}
