import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import ChatPanel from '../components/chat/ChatPanel.jsx'
import SessionMemory from '../components/session/SessionMemory.jsx'
import AnimatedBackground from '../components/layout/AnimatedBackground.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Workspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [memory, setMemory] = useState(null)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tradeOpen, setTradeOpen] = useState(false)
  const [journalPreview, setJournalPreview] = useState(null)
  const [previewMessage, setPreviewMessage] = useState(null)
  const [closing, setClosing] = useState(false)
  const [snapshots, setSnapshots] = useState([])
  const [snapshotName, setSnapshotName] = useState('')
  const [savingSnapshot, setSavingSnapshot] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)
  const [openedSnapshot, setOpenedSnapshot] = useState(null)
  const [loadingSnapshot, setLoadingSnapshot] = useState(false)
  const [visionSupported, setVisionSupported] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const messagesEndRef = useRef(null)
  const { theme } = useTheme()
  const bgColor = theme === 'green' ? '#050f0a' : '#0d1117'

  const loadSession = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.getSession(id)
      setSession(result.session)
      setMessages(result.messages || [])
      setMemory(result.session_memory)
    } catch (err) {
      setError(err.message || 'Impossibile caricare la sessione')
    } finally {
      setLoading(false)
    }
  }

  const loadSnapshots = async () => {
    try {
      const result = await api.getSnapshots(id)
      setSnapshots(Array.isArray(result) ? result : [])
    } catch (err) {
      // Lo snapshot è una funzione secondaria: non blocchiamo la pagina
      console.error('Impossibile caricare gli snapshot', err)
    }
  }

  const loadAgentInfo = async () => {
    try {
      const info = await api.getAgentInfo()
      setVisionSupported(info?.visionSupported !== false)
    } catch (err) {
      // Funzione informativa: in caso di errore manteniamo il default (true)
      console.error('Impossibile caricare le info del provider AI', err)
    }
  }

  useEffect(() => {
    loadSession()
    loadSnapshots()
    loadAgentInfo()
  }, [id])

  const handleOpenSnapshot = async (snapshotId) => {
    setLoadingSnapshot(true)
    setError(null)
    try {
      const result = await api.getSnapshot(id, snapshotId)
      setOpenedSnapshot(result)
    } catch (err) {
      setError(err.message || 'Errore durante l\'apertura dello snapshot')
    } finally {
      setLoadingSnapshot(false)
    }
  }

  const handleCloseSnapshotView = () => {
    setOpenedSnapshot(null)
  }

  const handleCloseSession = async () => {
    const confirmed = window.confirm(
      'Chiudere la sessione genererà un riassunto tramite AI (può comportare una chiamata al provider) e segnerà la sessione come "chiusa". Procedere?'
    )
    if (!confirmed) {
      return
    }

    setClosing(true)
    setError(null)
    setStatusMessage(null)

    try {
      const updated = await api.closeSession(id)
      setSession(updated)
      setStatusMessage('Sessione chiusa. Riassunto generato e salvato.')
    } catch (err) {
      setError(err.message || 'Errore durante la chiusura della sessione')
    } finally {
      setClosing(false)
    }
  }

  const handleCreateSnapshot = async () => {
    const name = snapshotName.trim()
    if (!name) {
      setError('Inserisci un nome per lo snapshot.')
      return
    }

    setSavingSnapshot(true)
    setError(null)
    setStatusMessage(null)

    try {
      await api.createSnapshot(id, name)
      setSnapshotName('')
      setStatusMessage(`Snapshot "${name}" salvato.`)
      await loadSnapshots()
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio dello snapshot')
    } finally {
      setSavingSnapshot(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setFocusMode(false) }
    if (focusMode) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusMode])

  const handleSaveJournalPreview = async () => {
    if (!journalPreview) {
      setError('Nessuna anteprima journal disponibile da salvare.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.createJournalEntry({ session_id: id, ...journalPreview })
      setPreviewMessage('Riga journal salvata con successo.')
      setJournalPreview(null)
    } catch (err) {
      setError(err.message || 'Errore salvataggio journal')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelJournalPreview = () => {
    setJournalPreview(null)
    setPreviewMessage('Anteprima journal annullata.')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!content.trim()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.sendMessage(id, content, files, {
        analysisMode: tradeOpen ? 'trade_open' : 'standard'
      })
      setMessages((prev) => [...prev, response.userMessage, response.assistantMessage])
      setContent('')
      setFiles([])
      setMemory(response.session_memory || memory)
    } catch (err) {
      setError(err.message || 'Errore invio messaggio')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateJournal = async () => {
    setLoading(true)
    setError(null)
    setJournalPreview(null)
    setPreviewMessage(null)

    try {
      const response = await api.sendMessage(id, '', [], {
        analysisMode: tradeOpen ? 'trade_open' : 'standard',
        journalMode: true,
        previewOnly: true
      })

      setMessages((prev) => [...prev, response.userMessage, response.assistantMessage])
      setMemory(response.session_memory || memory)

      if (response.journalEntry) {
        setJournalPreview(response.journalEntry)
        setPreviewMessage('Anteprima riga journal generata. Conferma per salvare.')
      } else {
        setPreviewMessage('Non è stato possibile parsare una riga journal dalla risposta. Controlla il contenuto generato dall’agente.')
      }
    } catch (err) {
      setError(err.message || 'Errore generazione journal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100" style={{ background: bgColor }}>
      <AnimatedBackground />
      <div className="relative z-10 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/analisi')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Torna indietro"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-semibold">Workspace Aware Trading</h1>
            <p className="mt-1 text-slate-400">Sessione: {session?.title || 'Nuova sessione'}</p>
            {session?.tags && (() => {
              let tags = []
              try { tags = JSON.parse(session.tags) } catch { tags = [] }
              return tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <span key={tag} className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">{tag}</span>
                  ))}
                </div>
              ) : null
            })()}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate('/analisi')} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800">
            Torna alle analisi
          </button>
          <button onClick={() => navigate('/journal')} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Apri Journal
          </button>
          <button onClick={() => navigate(`/workspace/${id}/timeline`)} className="rounded-xl px-4 py-2 text-sm font-semibold transition bg-slate-800 text-slate-200 hover:bg-slate-700">
            Apri Timeline
          </button>
          <button
            onClick={() => setTradeOpen((prev) => !prev)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tradeOpen ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
          >
            {tradeOpen ? 'Modalità trade aperto: ON' : 'Attiva trade aperto'}
          </button>
          <button
            onClick={() => setFocusMode(true)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
          >
            🎯 Focus
          </button>
          <button
            onClick={handleCloseSession}
            disabled={closing || session?.status === 'closed'}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-400 disabled:opacity-50"
          >
            {session?.status === 'closed' ? 'Sessione chiusa' : closing ? 'Chiusura...' : 'Chiudi sessione'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-200">
          {statusMessage}
        </div>
      )}

      {session?.summary && (
        <div className="mb-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">Riassunto sessione</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">{session.summary}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <ChatPanel
            messages={messages}
            content={content}
            onContentChange={setContent}
            files={files}
            onFilesChange={setFiles}
            onSubmit={handleSubmit}
            onGenerateJournal={handleGenerateJournal}
            loading={loading}
            error={error}
            visionSupported={visionSupported}
          />

          {previewMessage && (
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 text-slate-100 shadow-xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-amber-200">Anteprima Journal</h2>
                  <p className="mt-1 text-sm text-amber-300">{previewMessage}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveJournalPreview}
                    disabled={loading || !journalPreview}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    Salva riga journal
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelJournalPreview}
                    disabled={loading}
                    className="rounded-xl border border-amber-500 bg-slate-900 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-slate-950 disabled:opacity-50"
                  >
                    Annulla
                  </button>
                </div>
              </div>

              {journalPreview ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(journalPreview).map(([key, value]) => (
                    <div key={key} className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{key.replace(/_/g, ' ')}</div>
                      <div className="mt-1 text-sm text-slate-100">{value || '-'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-amber-500/40 bg-slate-950 p-4 text-sm text-amber-200">Nessuna anteprima disponibile.</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <SessionMemory memory={memory} />

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-100">Snapshot analisi</h2>
            <p className="mt-1 text-sm text-slate-400">Salva lo stato corrente come fotografia nominabile.</p>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="Nome snapshot (es. Setup 4H)"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCreateSnapshot}
                disabled={savingSnapshot || !snapshotName.trim()}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {savingSnapshot ? 'Salvataggio...' : 'Salva snapshot'}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {snapshots.length === 0 ? (
                <div className="text-sm text-slate-500">Nessuno snapshot salvato.</div>
              ) : (
                snapshots.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="truncate text-slate-100">{s.name}</div>
                      <div className="text-xs text-slate-500">{new Date(s.created_at).toLocaleString()}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenSnapshot(s.id)}
                      disabled={loadingSnapshot}
                      className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-cyan-500 hover:bg-slate-900 disabled:opacity-50"
                    >
                      Apri
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {openedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={handleCloseSnapshotView}>
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">Snapshot: {openedSnapshot.name}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Sola lettura — fotografia salvata il {new Date(openedSnapshot.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseSnapshotView}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                Chiudi
              </button>
            </div>

            <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">Memoria salvata</h3>
              {openedSnapshot.memory ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {['asset', 'timeframes', 'structure', 'levels', 'notes'].map((key) => (
                    <div key={key} className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{key}</div>
                      <div className="mt-1 whitespace-pre-wrap text-slate-100">{openedSnapshot.memory[key] || '-'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Nessuna memoria salvata in questo snapshot.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">Messaggi salvati</h3>
              {openedSnapshot.messages && openedSnapshot.messages.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {openedSnapshot.messages.map((m, index) => (
                    <div
                      key={m.id || index}
                      className={`rounded-2xl border p-3 text-sm ${m.role === 'user' ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-slate-800 bg-slate-900'}`}
                    >
                      <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                        {m.role === 'user' ? 'Trader' : 'Agente'}
                      </div>
                      <div className="whitespace-pre-wrap text-slate-100">{m.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Nessun messaggio salvato in questo snapshot.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {focusMode && (
        <div className="fixed inset-0 z-50 flex flex-col p-5" style={{ background: bgColor }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-400">🎯 Focus Mode — premi Esc per uscire</span>
            <button
              onClick={() => setFocusMode(false)}
              className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800 transition"
            >
              Esci
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              messages={messages}
              content={content}
              onContentChange={setContent}
              files={files}
              onFilesChange={setFiles}
              onSubmit={handleSubmit}
              onGenerateJournal={handleGenerateJournal}
              loading={loading}
              error={error}
              visionSupported={visionSupported}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
