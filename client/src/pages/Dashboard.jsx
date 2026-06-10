import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [assetFilter, setAssetFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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

    try {
      const session = await api.createSession({})
      navigate(`/workspace/${session.id}`)
    } catch (err) {
      setError(err.message || 'Errore creazione sessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-5">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Aware Trading Workspace</h1>
          <p className="mt-1 text-slate-400">Avvia una nuova sessione o riapri una sessione esistente.</p>
        </div>
        <button
          onClick={handleCreateSession}
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
                // include the whole day
                to.setHours(23, 59, 59, 999)
                const updated = new Date(session.updated_at)
                if (updated > to) return false
              }
              return true
            })

            return (
              <div className="space-y-3">
                {filtered.map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/workspace/${session.id}`)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-left transition hover:border-cyan-500"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <div className="text-sm text-slate-400">{session.status?.toUpperCase() || 'ACTIVE'}</div>
                    <div className="mt-1 text-lg font-semibold text-white">{session.title || 'Sessione senza titolo'}</div>
                  </div>
                  <div className="text-sm text-slate-500">Aggiornata: {new Date(session.updated_at).toLocaleString()}</div>
                </div>
                <div className="mt-3 text-slate-400">Asset: {session.asset || 'Non specificato'}</div>
              </button>
                ))}
                {filtered.length === 0 && <div className="text-slate-500">Nessuna sessione corrisponde ai filtri.</div>}
              </div>
            )
          })()
        )}
      </section>
    </div>
  )
}
