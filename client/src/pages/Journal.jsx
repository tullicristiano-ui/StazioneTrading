import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useNavigate } from 'react-router-dom'

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.getJournal()
      .then(setEntries)
      .catch((err) => setError(err.message || 'Errore caricamento journal'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Journal</h1>
          <p className="mt-1 text-slate-400">Riepilogo delle righe salvate durante le sessioni.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/analisi')} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800">
            Torna alle analisi
          </button>
          <a
            href={api.exportJournalCSV()}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Esporta CSV
          </a>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-500/20 p-4 text-sm text-red-100">{error}</div>}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        {loading ? (
          <div className="text-slate-400">Caricamento...</div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
            Nessuna voce nel journal. Le righe aggiunte qui appariranno automaticamente.
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Sessione: {entry.session_id || 'N/A'}</div>
                    <div className="mt-1 text-lg font-semibold text-white">{entry.asset || entry.entry || 'Journal entry'}</div>
                  </div>
                  <div className="text-sm text-slate-500">{new Date(entry.created_at).toLocaleString()}</div>
                </div>
                {entry.nota && <p className="mt-3 text-slate-300">{entry.nota}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
