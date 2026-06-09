const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  }

  if (process.env.OPENROUTER_API_KEY) {
    headers.Authorization = `Bearer ${process.env.OPENROUTER_API_KEY}`
  }

  headers['HTTP-Referer'] = process.env.HTTP_REFERER || 'Aware Trading Workspace'
  headers['X-Title'] = process.env.X_TITLE || 'Aware Trading Agent Request'
  return headers
}

export async function requestCompletion(payload) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY')
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const body = await response.text()
    const errorMessage = `OpenRouter error ${response.status}: ${body}`
    throw new Error(errorMessage)
  }

  return response.json()
}

export function parseCompletionResponse(data) {
  if (!data) {
    return null
  }

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
