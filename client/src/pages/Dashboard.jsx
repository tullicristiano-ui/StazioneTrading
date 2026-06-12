import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="w-52 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col gap-2 p-4 min-h-screen">
      <div className="mb-4">
        <span className="text-cyan-400 font-bold text-lg tracking-tight">Aware Trading</span>
      </div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition text-left"
      >
        <span>🏠</span> Dashboard
      </button>
      <button
        onClick={() => navigate('/journal')}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition text-left"
      >
        <span>📓</span> Journal
      </button>
    </aside>
  )
}

function Modal({ title, onConfirm, onCancel, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
        {children}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 transition"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
          >
            Crea
          </button>
        </div>
      </div>
    </div>
  )
}

function EditModal({ session, onSave, onCancel }) {
  const [title, setTitle] = useState(session.title || '')
  const [asset, setAsset] = useState(session.asset || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-white">Modifica sessione</h3>
        <label className="block mb-1 text-sm text-slate-400">Titolo</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Es. Analisi EUR/USD mattina"
          className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <label className="block mb-1 text-sm text-slate-400">Asset</label>
        <input
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          placeholder="Es. EUR/USD, XAU/USD"
          className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 transition"
          >
            Annulla
          </button>
          <button
            onClick={() => onSave({ title, asset })}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [assetFilter, setAssetFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showNewModal, setShowNewModal] = useState(false)
  const [newAsset, setNewAsset] = useState('')
  const [newTitle, setNewTitle] = useState('')

  const [editingSession, setEditingSession] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.getSessions()
      .then(setSessions)
      .catch((err) => setError(err.message || 'Errore caricamento sessioni'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreateSession = async () => {
    setLoading(true)
    setError(null)
    setShowNewModal(false)

    try {
      const assetValue = newAsset.trim()
      const titleValue = newTitle.trim()
      const body = {}
      if (assetValue) body.asset = assetValue
      if (titleValue) body.title = titleValue
      const session = await api.createSession(body)
      navigate(`/workspace/${session.id}`)
    } catch (err) {
      setError(err.message || 'Errore creazione sessione')
    } finally {
      setLoading(false)
      setNewAsset('')
      setNewTitle('')
    }
  }

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation()
    const confirmed = window.confirm(
      'Vuoi eliminare questa analisi? Verranno cancellati per sempre chat, screenshot, righe di diario e snapshot collegati.'
    )
    if (!confirmed) return

    try {
      await api.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (err) {
      setError(err.message || "Errore durante l'eliminazione della sessione")
    }
  }

  const handleEditSave = async ({ title, asset }) => {
    const session = editingSession
    setEditingSession(null)
    try {
      const updated = await api.updateSession(session.id, { title, asset })
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    } catch (err) {
      setError(err.message || 'Errore durante la modifica della sessione')
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <div className="flex-1 p-5">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Aware Trading Workspace</h1>
            <p className="mt-1 text-slate-400">Avvia una nuova sessione o riapri una sessione esistente.</p>
          </div>
          <button
            onClick={() => { setNewAsset(''); setNewTitle(''); setShowNewModal(true) }}
            disabled={loading}
            className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            Nuova analisi
          </button>
        </header>

        {error && <div className="mb-4 rounded-xl bg-red-500/20 p-4 text-sm text-red-100">{error}</div>}

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-semibold">Sessioni recenti</h2>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <input
                placeholder="Filtra per asset"
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
              />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAssetFilter(''); setDateFrom(''); setDateTo('') }}
                className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
              >
                Pulisci
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-slate-400">Caricamento...</div>
          ) : sessions.length === 0 ? (
            <div className="text-slate-500">Nessuna sessione ancora creata. Clicca su "Nuova analisi" per iniziare.</div>
          ) : (
            (() => {
              const filtered = sessions.filter((session) => {
                if (assetFilter && !(session.asset || '').toLowerCase().includes(assetFilter.toLowerCase())) return false
                if (dateFrom) {
                  const from = new Date(dateFrom)
                  const updated = new Date(session.updated_at)
                  if (updated < from) return false
                }
                if (dateTo) {
                  const to = new Date(dateTo)
                  to.setHours(23, 59, 59, 999)
                  const updated = new Date(session.updated_at)
                  if (updated > to) return false
                }
                return true
              })

              return (
                <div className="space-y-3">
                  {filtered.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => navigate(`/workspace/${session.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/workspace/${session.id}`)}
                      className="relative w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-left transition hover:border-cyan-500 cursor-pointer"
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingSession(session) }}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-700 hover:text-slate-200 transition"
                          title="Modifica titolo e asset"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition"
                          title="Elimina questa analisi"
                        >
                          🗑
                        </button>
                      </div>

                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start pr-16">
                        <div>
                          <div className="text-sm text-slate-400">{session.status?.toUpperCase() || 'ACTIVE'}</div>
                          <div className="mt-1 text-lg font-semibold text-white">{session.title || 'Sessione senza titolo'}</div>
                        </div>
                        <div className="text-sm text-slate-500 flex flex-col items-end gap-0.5">
                          <span>Aperta: {new Date(session.created_at).toLocaleString()}</span>
                          <span>Aggiornata: {new Date(session.updated_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-3 text-slate-400">Asset: {session.asset || 'Non specificato'}</div>
                    </div>
                  ))}
                  {filtered.length === 0 && <div className="text-slate-500">Nessuna sessione corrisponde ai filtri.</div>}
                </div>
              )
            })()
          )}
        </section>
      </div>

      {showNewModal && (
        <Modal
          title="Nuova analisi"
          onConfirm={handleCreateSession}
          onCancel={() => { setShowNewModal(false); setNewAsset(''); setNewTitle('') }}
        >
          <label className="block mb-1 text-sm text-slate-400">Titolo (facoltativo)</label>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
            placeholder="Es. Analisi mattina, Setup H4"
            className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <label className="block mb-1 text-sm text-slate-400">Asset (facoltativo)</label>
          <input
            value={newAsset}
            onChange={(e) => setNewAsset(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
            placeholder="Es. EUR/USD, XAU/USD"
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <p className="mt-2 text-xs text-slate-500">Entrambi i campi sono facoltativi: puoi aggiungerli anche in seguito.</p>
        </Modal>
      )}

      {editingSession && (
        <EditModal
          session={editingSession}
          onSave={handleEditSave}
          onCancel={() => setEditingSession(null)}
        />
      )}
    </div>
  )
}
