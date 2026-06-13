import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/layout/AnimatedBackground.jsx'

function JournalStats({ entries }) {
  const total = entries.length
  const assetCount = {}
  entries.forEach(e => { if (e.asset) assetCount[e.asset] = (assetCount[e.asset] || 0) + 1 })
  const topAsset = Object.entries(assetCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  const lastDate = entries.length > 0
    ? new Date(Math.max(...entries.map(e => new Date(e.created_at).getTime()))).toLocaleDateString('it-IT')
    : '—'
  return (
    <div className="mb-5 grid grid-cols-3 gap-3">
      {[
        { value: total, label: 'Analisi totali', color: 'text-emerald-400', size: 'text-2xl' },
        { value: topAsset, label: 'Asset più analizzato', color: 'text-teal-400', size: 'text-lg' },
        { value: lastDate, label: 'Ultima analisi', color: 'text-slate-200', size: 'text-sm' },
      ].map(({ value, label, color, size }) => (
        <div key={label} className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-4 text-center">
          <div className={`${size} font-bold ${color}`}>{value}</div>
          <div className="text-xs text-slate-400 mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}

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
    <div className="relative min-h-screen overflow-hidden text-slate-100" style={{ background: '#050f0a' }}>
      <AnimatedBackground />
      <div className="relative z-10 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Torna indietro"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-semibold">Journal</h1>
            <p className="mt-1 text-slate-400">Riepilogo delle righe salvate durante le sessioni.</p>
          </div>
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

      {!loading && <JournalStats entries={entries} />}

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
    </div>
  )
}
