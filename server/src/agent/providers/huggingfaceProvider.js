/**
 * HuggingFace Inference Provider Adapter
 *
 * Usa l'endpoint OpenAI-compatibile di HuggingFace Inference API.
 * Testato con modelli Gemma (google/gemma-2-9b-it, google/gemma-2-27b-it).
 *
 * Limitazioni rispetto a OpenRouter:
 *  - Nessun supporto vision nativo → i blocchi image_url vengono rimossi
 *    e sostituiti con una nota testuale
 *  - Alcuni modelli potrebbero non supportare system role → merge in user
 *  - JSON strutturato non garantito → parsing con fallback robusto
 *  - Modelli gratuiti su HF possono rispondere con 503 (modello in caricamento)
 */

const HF_CHAT_URL = 'https://router.huggingface.co/v1/chat/completions'

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const token = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

/**
 * Normalizza i messaggi per modelli text-only:
 * - Converte content array (image_url + text) in stringa piatta
 * - Aggiunge nota se c'erano immagini (evita silenzio silente)
 */
function normalizeMessagesForTextModel(messages) {
  return messages.map((msg) => {
    if (!Array.isArray(msg.content)) return msg

    const textParts = []
    let hasImages = false

    for (const block of msg.content) {
      if (block.type === 'text' && block.text) {
        textParts.push(block.text)
      } else if (block.type === 'image_url') {
        hasImages = true
      }
    }

    if (hasImages) {
      textParts.push('[Nota: screenshot allegati non elaborabili in modalità testo. Descrivi il grafico a parole se necessario.]')
    }

    return { ...msg, content: textParts.join('\n').trim() }
  }).filter((msg) => msg.content && msg.content.length > 0)
}

export async function requestCompletion(payload) {
  if (!process.env.HUGGINGFACE_API_KEY && !process.env.HF_TOKEN) {
    throw new Error('Missing HUGGINGFACE_API_KEY or HF_TOKEN')
  }

  const model = process.env.HUGGINGFACE_MODEL || process.env.HF_MODEL || 'google/gemma-2-9b-it'
  const cleanMessages = normalizeMessagesForTextModel(payload.messages || [])

  const hfPayload = {
    model,
    messages: cleanMessages,
    temperature: payload.temperature ?? 0.3,
    max_tokens: payload.max_tokens ?? 1000,
    stream: false
  }

  // Timeout della chiamata: se l'AI non risponde entro il limite, interrompiamo.
  const hfTimeout = Number(process.env.HF_TIMEOUT_MS) || 90000
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), hfTimeout)

  let response
  try {
    response = await fetch(HF_CHAT_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(hfPayload),
      signal: controller.signal
    })
  } catch (networkErr) {
    if (networkErr.name === 'AbortError') {
      throw new Error("HuggingFace: l'AI non ha risposto entro il tempo limite, riprova.")
    }
    throw new Error(`HuggingFace: errore di rete — ${networkErr.message}`)
  } finally {
    clearTimeout(timer)
  }

  // 503 = modello in caricamento (tier gratuito HF)
  if (response.status === 503) {
    const body = await response.json().catch(() => ({}))
    const eta = body?.estimated_time ? ` Riprova tra circa ${Math.ceil(body.estimated_time)}s.` : ''
    throw new Error(`HuggingFace: il modello è in fase di caricamento.${eta}`)
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`HuggingFace error ${response.status}: ${body}`)
  }

  return response.json()
}

/**
 * Parsing della risposta HuggingFace.
 * Percorso principale: OpenAI-compatible choices[0].message.content
 * Fallback: generated_text (alcuni modelli HF non-chat)
 * Extra: pulizia di eventuali token speciali Gemma residui
 */
export function parseResponse(data) {
  if (!data) return null

  const choiceText = data?.choices?.[0]?.message?.content
  if (typeof choiceText === 'string' && choiceText.length > 0) {
    return sanitizeGemmaOutput(choiceText.trim())
  }

  if (Array.isArray(choiceText)) {
    const joined = choiceText.map((block) => block?.text || '').join(' ').trim()
    if (joined.length > 0) return sanitizeGemmaOutput(joined)
  }

  // Fallback legacy HF
  if (typeof data.generated_text === 'string') {
    return sanitizeGemmaOutput(data.generated_text.trim())
  }

  return null
}

/**
 * Rimuove eventuali token speciali Gemma che a volte compaiono nell'output
 * quando il modello non è perfettamente allineato con il template chat.
 */
function sanitizeGemmaOutput(text) {
  return text
    .replace(/<\|im_start\|>.*?<\|im_end\|>/gs, '')
    .replace(/<start_of_turn>.*?<end_of_turn>/gs, '')
    .replace(/<\/?.[a-z_]+>/g, '')
    .trim()
}
