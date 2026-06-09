export default function SessionMemory({ memory }) {
  if (!memory) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-400">
        <h2 className="mb-3 text-lg font-semibold text-white">Session Memory</h2>
        <p>Le informazioni strutturate della sessione appariranno qui dopo l'analisi.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100">
      <h2 className="mb-4 text-lg font-semibold text-white">Session Memory</h2>
      <div className="space-y-3 text-sm">
        <div>
          <div className="text-slate-400">Asset</div>
          <div className="mt-1 text-white">{memory.asset || 'Non definito'}</div>
        </div>
        <div>
          <div className="text-slate-400">Timeframes</div>
          <div className="mt-1 text-white">{memory.timeframes || 'Non definito'}</div>
        </div>
        <div>
          <div className="text-slate-400">Struttura</div>
          <div className="mt-1 text-white whitespace-pre-wrap">{memory.structure || 'Non definito'}</div>
        </div>
        <div>
          <div className="text-slate-400">Livelli</div>
          <div className="mt-1 text-white whitespace-pre-wrap">{memory.levels || 'Non definito'}</div>
        </div>
        <div>
          <div className="text-slate-400">Note</div>
          <div className="mt-1 text-white whitespace-pre-wrap">{memory.notes || 'Nessuna nota disponibile'}</div>
        </div>
      </div>
    </div>
  )
}
