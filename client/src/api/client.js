const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err)
    throw err
  }
}

export const api = {
  // Sessions
  getSessions: () => request('/sessions'),
  getSession: (id) => request(`/sessions/${id}`),
  createSession: (data) => request('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  updateSession: (id, data) => request(`/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Messages & Agent
  sendMessage: (sessionId, content, screenshots = []) => {
    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('content', content)
    screenshots.forEach((file, idx) => {
      formData.append('screenshots', file)
    })
    
    return fetch(`${API_BASE}/agent/analyze`, {
      method: 'POST',
      body: formData,
    }).then(r => r.json())
  },

  // Journal
  getJournal: (sessionId = null) => {
    const query = sessionId ? `?session_id=${sessionId}` : ''
    return request(`/journal${query}`)
  },
  createJournalEntry: (data) => request('/journal', { method: 'POST', body: JSON.stringify(data) }),
  exportJournalCSV: () => `${API_BASE}/journal/export.csv`,
}
