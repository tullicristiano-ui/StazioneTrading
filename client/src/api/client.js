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
  closeSession: (id) => request(`/sessions/${id}/close`, { method: 'POST' }),
  deleteSession: (id) => request(`/sessions/${id}`, { method: 'DELETE' }),

  // Snapshots
  getSnapshots: (id) => request(`/sessions/${id}/snapshots`),
  getSnapshot: (sessionId, snapshotId) => request(`/sessions/${sessionId}/snapshots/${snapshotId}`),
  createSnapshot: (id, name) => request(`/sessions/${id}/snapshots`, { method: 'POST', body: JSON.stringify({ name }) }),
  deleteSnapshot: (sessionId, snapshotId) => request(`/sessions/${sessionId}/snapshots/${snapshotId}`, { method: 'DELETE' }),

  // Agent info (provider attivo, supporto vision)
  getAgentInfo: () => request('/agent/info'),

  // Messages & Agent
  sendMessage: (sessionId, content = '', screenshots = [], options = {}) => {
    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('content', content)
    formData.append('analysis_mode', options.analysisMode || 'standard')
    if (options.journalMode) {
      formData.append('journal_mode', 'true')
    }
    if (options.previewOnly) {
      formData.append('preview_only', 'true')
    }

    screenshots.forEach((file) => {
      formData.append('screenshots', file)
    })

    return fetch(`${API_BASE}/agent/analyze`, {
      method: 'POST',
      body: formData,
    }).then((r) => r.json())
  },

  // Journal
  getJournal: (sessionId = null) => {
    const query = sessionId ? `?session_id=${sessionId}` : ''
    return request(`/journal${query}`)
  },
  createJournalEntry: (data) => request('/journal', { method: 'POST', body: JSON.stringify(data) }),
  updateJournalEntry: (id, data) => request(`/journal/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteJournalEntry: (id) => request(`/journal/${id}`, { method: 'DELETE' }),
  exportJournalCSV: () => `${API_BASE}/journal/export.csv`,
}
