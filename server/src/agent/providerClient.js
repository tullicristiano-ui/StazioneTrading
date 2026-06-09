/**
 * providerClient.js — Provider Router
 *
 * Interfaccia unica verso i provider AI.
 * Seleziona il provider tramite la variabile d'ambiente AI_PROVIDER.
 *
 * Provider supportati:
 *  - openrouter (default) → richiede OPENROUTER_API_KEY
 *  - huggingface | hf    → richiede HUGGINGFACE_API_KEY + HUGGINGFACE_MODEL
 *
 * L'orchestrator non cambia: continua a chiamare requestCompletion()
 * e parseCompletionResponse() come prima.
 */

import * as openrouter from './providers/openrouterProvider.js'
import * as huggingface from './providers/huggingfaceProvider.js'

const PROVIDERS = {
  openrouter,
  huggingface,
  hf: huggingface
}

function getProvider() {
  const name = (process.env.AI_PROVIDER || 'openrouter').toLowerCase().trim()
  const adapter = PROVIDERS[name]
  if (!adapter) {
    console.warn(`providerClient: provider "${name}" sconosciuto, fallback su openrouter`)
    return { name: 'openrouter', adapter: openrouter }
  }
  return { name, adapter }
}

/**
 * Esegue la chiamata al provider attivo.
 * Signature identica all'originale — nessuna modifica all'orchestrator richiesta.
 */
export async function requestCompletion(payload) {
  const { name, adapter } = getProvider()
  console.log(`providerClient: usando provider "${name}"`)
  return adapter.requestCompletion(payload)
}

/**
 * Estrae il testo dalla risposta del provider attivo.
 * Signature identica all'originale.
 */
export function parseCompletionResponse(data) {
  const { adapter } = getProvider()
  return adapter.parseResponse(data)
}

/**
 * Utility: restituisce il nome del provider attivo.
 * Utile per logging e debug nell'orchestrator se necessario.
 */
export function getActiveProvider() {
  return getProvider().name
}
