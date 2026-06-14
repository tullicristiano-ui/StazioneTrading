import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import Sidebar from '../components/layout/Sidebar.jsx'
import AnimatedBackground from '../components/layout/AnimatedBackground.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

// ── Icona candela SVG ─────────────────────────────────────────────────────────

function CandleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="24" y1="2" x2="24" y2="10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      <rect x="16" y="10" width="16" height="22" rx="2" fill="#10b981" />
      <line x1="24" y1="32" x2="24" y2="46" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <rect x="19" y="38" width="10" height="6" rx="1" fill="#ef4444" opacity="0.7" />
    </svg>
  )
}

// ── Calendario mensile ────────────────────────────────────────────────────────

function MiniCalendar() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const todayDate = today.getDate()
  const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
  const dayNames = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = (firstDay + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="mt-10 max-w-sm mx-auto rounded-2xl border border-emerald-900/50 bg-emerald-950/20 backdrop-blur-sm p-4">
      <div className="text-center text-sm font-semibold text-emerald-300 mb-3">
        {monthNames[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map(d => (
          <div key={d} className="text-xs text-slate-500 pb-1">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className={`text-xs rounded-full w-7 h-7 flex items-center justify-center mx-auto
            ${day === todayDate ? 'bg-emerald-500 text-black font-bold' : day ? 'text-slate-300 hover:bg-emerald-900/30' : ''}`}>
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Vetrina pubblicitaria (vantaggi app) ──────────────────────────────────────

const AD_BENEFITS = [
  { icon: '🤖', title: 'Analisi con l\'AI',   desc: 'Leggi la struttura del mercato col metodo Aware Trader, direttamente sui tuoi grafici.' },
  { icon: '📊', title: 'Mercati in tempo reale', desc: 'Grafici avanzati, heatmap, news e calendario economico, sempre aggiornati.' },
  { icon: '📓', title: 'Journal completo',    desc: 'Registra ogni trade con entry, stop e target. Esporta tutto in CSV quando vuoi.' },
  { icon: '🧠', title: 'Memoria delle sessioni', desc: 'L\'app ricorda asset, livelli e struttura di ogni tua analisi precedente.' },
  { icon: '🔒', title: '100% sul tuo computer', desc: 'Nessun dato esce dal tuo PC. Privacy totale, nessun account richiesto.' },
  { icon: '⚡', title: 'Veloce e gratuito',    desc: 'Nessun costo nascosto, nessuna registrazione. Pronto all\'uso.' },
]

function AdShowcase() {
  return (
    <section className="mt-14 w-full max-w-5xl font-display">
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500 mb-2">
        Perché usarla
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-8 leading-tight">
        Tutto ciò che ti serve per analizzare i mercati
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
        {AD_BENEFITS.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-2xl border border-emerald-800/40 bg-gradient-to-br from-emerald-950/40 to-emerald-900/10
              p-5 transition hover:border-emerald-500/60 hover:from-emerald-900/40 hover:-translate-y-1"
          >
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="text-lg font-bold text-emerald-300 mb-1 leading-snug">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Home page ─────────────────────────────────────────────────────────────────

const FEATURE_CARDS = [
  {
    icon: '🤖',
    title: 'Agente AI',
    desc: 'Analizza i tuoi grafici con il metodo Aware Trader e ricevi analisi strutturate della price action.',
  },
  {
    icon: '📊',
    title: 'Mercati Live',
    desc: 'Grafici avanzati, heatmap, news e calendario economico in tempo reale grazie ai widget TradingView.',
  },
  {
    icon: '📓',
    title: 'Journal',
    desc: 'Registra ogni trade analizzato, tieni traccia delle tue decisioni e scarica il diario in formato CSV.',
  },
]

const ASSETS = [
  { symbol: 'BINANCE:BTCUSDT',  label: 'BTC' },
  { symbol: 'FX:EURUSD',        label: 'EUR/USD' },
  { symbol: 'OANDA:XAUUSD',     label: 'XAU/USD' },
  { symbol: 'OANDA:XAGUSD',     label: 'XAG/USD' },
  { symbol: 'NASDAQ:NDX',       label: 'NASDAQ' },
  { symbol: 'OANDA:NAS100USD',  label: 'US100' },
  { symbol: 'OANDA:WTICOUSD',   label: 'USOIL' },
  { symbol: 'COINBASE:ETHUSD',  label: 'ETH/USD' },
  { symbol: 'TVC:DXY',          label: 'DXY' },
]

function AssetWidget({ symbol, label }) {
  const containerRef = useRef(null)
  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''
    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-widget-container'
    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height: 130,
      locale: 'it',
      dateRange: '1D',
      colorTheme: 'dark',
      isTransparent: true,
      autosize: false,
      largeChartUrl: ''
    })
    wrapper.appendChild(widgetDiv)
    wrapper.appendChild(script)
    containerRef.current.appendChild(wrapper)
  }, [symbol])
  return (
    <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 overflow-hidden">
      <div className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-400">{label}</div>
      <div ref={containerRef} />
    </div>
  )
}

function isMarketOpen(openHourUTC, closeHourUTC, openMinUTC, closeMinUTC) {
  const now = new Date()
  const day = now.getUTCDay()
  if (day === 0 || day === 6) return false
  const totalMinNow = now.getUTCHours() * 60 + now.getUTCMinutes()
  const openTotal  = openHourUTC  * 60 + openMinUTC
  const closeTotal = closeHourUTC * 60 + closeMinUTC
  return totalMinNow >= openTotal && totalMinNow < closeTotal
}

function ActiveSessionBanner({ session, onOpen }) {
  if (!session) return null
  return (
    <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 max-w-lg mx-auto">
      <div className="text-sm">
        <span className="text-cyan-300 font-semibold">Sessione in corso:</span>{' '}
        <span className="text-slate-200">{session.title || session.asset || 'Nuova sessione'}</span>
      </div>
      <button
        onClick={onOpen}
        className="shrink-0 rounded-lg bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
      >
        Riapri →
      </button>
    </div>
  )
}

export default function Markets() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [now, setNow] = useState(new Date())
  const [activeSession, setActiveSession] = useState(null)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const bgColor = theme === 'green' ? '#050f0a' : '#0d1117'

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    api.getSessions()
      .then(sessions => {
        const active = sessions.find(s => s.status !== 'closed')
        setActiveSession(active || null)
      })
      .catch(() => {})
  }, [])

  return (
    <div
      className="relative min-h-screen overflow-hidden text-slate-100"
      style={{ background: bgColor }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Header: hamburger + orologio + mercati */}
        <header className="p-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-emerald-900/40 hover:text-slate-200 transition"
            aria-label="Apri menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <div className="text-lg font-mono font-semibold text-emerald-400">
                {now.toLocaleTimeString('it-IT')}
              </div>
              <div className="flex gap-2 mt-1">
                {[
                  { name: 'LON', open: isMarketOpen(8, 16, 0, 30) },
                  { name: 'NY',  open: isMarketOpen(13, 20, 30, 0) },
                  { name: 'TYO', open: isMarketOpen(0, 6, 0, 0) },
                ].map(({ name, open }) => (
                  <span key={name} className={`text-xs px-1.5 py-0.5 rounded-full ${open ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-500'}`}>
                    {open ? '●' : '○'} {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-start px-6 pt-8 pb-16 text-center">

          <CandleIcon />

          <h1 className="mt-6 text-6xl font-bold tracking-tight leading-tight pb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Stazione di Trading
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300 text-xl leading-relaxed">
            Il tuo copilota per i mercati finanziari.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/analisi?new=1')}
              className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400"
            >
              ➕ Nuova Analisi
            </button>
            <button
              onClick={() => navigate('/analisi')}
              className="rounded-xl border border-emerald-700 px-6 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-950"
            >
              📂 Le mie Analisi
            </button>
            <button
              onClick={() => navigate('/journal')}
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              📓 Journal
            </button>
            <button
              onClick={() => navigate('/trading-live')}
              className="rounded-xl border border-teal-700 px-6 py-3 font-semibold text-teal-300 transition hover:bg-teal-950"
            >
              📈 Trading Live
            </button>
          </div>

          <AdShowcase />

          <ActiveSessionBanner session={activeSession} onOpen={() => navigate(`/workspace/${activeSession?.id}`)} />

          <MiniCalendar />

          {/* Panoramica asset */}
          <div className="mt-10 w-full max-w-4xl">
            <h2 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Panoramica Asset
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ASSETS.map(a => <AssetWidget key={a.symbol} symbol={a.symbol} label={a.label} />)}
            </div>
          </div>

          {/* Feature cards */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full">
            {FEATURE_CARDS.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 backdrop-blur-sm p-5 text-left"
              >
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="font-semibold text-emerald-300 mb-1">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}
