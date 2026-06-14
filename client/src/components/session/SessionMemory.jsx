function BiasIndicator({ structure }) {
  if (!structure) return null
  const t = structure.toLowerCase()
  const isBull = /rialzist|bullish|\blong\b|uptrend|\bup\b/.test(t)
  const isBear = /ribassist|bearish|\bshort\b|downtrend|\bdown\b/.test(t)
  if (isBull) return (
    <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
      <span className="text-lg">▲</span>
      <span className="text-sm font-semibold text-emerald-300">Bias: RIALZISTA</span>
    </div>
  )
  if (isBear) return (
    <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2">
      <span className="text-lg">▼</span>
      <span className="text-sm font-semibold text-rose-300">Bias: RIBASSISTA</span>
    </div>
  )
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-700/30 border border-slate-600/30 px-3 py-2">
      <span className="text-lg">◆</span>
      <span className="text-sm font-semibold text-slate-400">Bias: NEUTRO</span>
    </div>
  )
}

export default function SessionMemory({ memory }) {
  if (!memory) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-5 text-slate-400">
        <h2 className="mb-3 text-lg font-semibold text-white">Session Memory</h2>
        <p>Le informazioni strutturate della sessione appariranno qui dopo l'analisi.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5 text-slate-100">
      <h2 className="mb-4 text-lg font-semibold text-white">Session Memory</h2>
      <BiasIndicator structure={memory?.structure} />
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
