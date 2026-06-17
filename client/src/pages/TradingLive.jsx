import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import TradingViewWidget from '../components/markets/TradingViewWidget.jsx'
import AnimatedBackground from '../components/layout/AnimatedBackground.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { api } from '../api/client.js'

// ── Widget configs ────────────────────────────────────────────────────────────

const ADVANCED_CHART_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
const ADVANCED_CHART_CONFIG = {
  colorTheme: 'dark', locale: 'it', autosize: true,
  symbol: 'FOREXCOM:SPXUSD', interval: 'D', timezone: 'Europe/Rome',
  style: '1', allow_symbol_change: true, withdateranges: true,
  hide_side_toolbar: false, save_image: true,
}

const MARKET_OVERVIEW_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
const MARKET_OVERVIEW_CONFIG = {
  colorTheme: 'dark', dateRange: '12M', showChart: true, locale: 'it',
  largeChartUrl: '', isTransparent: false, showSymbolLogo: true,
  showFloatingTooltip: false, width: '100%', height: '100%',
  tabs: [
    {
      title: 'Indici', originalTitle: 'Indices',
      symbols: [
        { s: 'FOREXCOM:SPXUSD', d: 'S&P 500 (US500)' },
        { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100 (US100)' },
        { s: 'INDEX:FTSEMIB', d: 'FTSE MIB' },
      ],
    },
    {
      title: 'Forex', originalTitle: 'Forex',
      symbols: [
        { s: 'FX:EURUSD', d: 'EUR/USD' }, { s: 'FX:GBPUSD', d: 'GBP/USD' },
        { s: 'FX:USDJPY', d: 'USD/JPY' }, { s: 'FX:USDCHF', d: 'USD/CHF' },
      ],
    },
    {
      title: 'Commodity', originalTitle: 'Commodities',
      symbols: [
        { s: 'TVC:GOLD', d: 'Gold' }, { s: 'TVC:SILVER', d: 'Silver' },
        { s: 'TVC:USOIL', d: 'Oil (WTI)' },
      ],
    },
    {
      title: 'Crypto', originalTitle: 'Crypto',
      symbols: [
        { s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' },
        { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' },
      ],
    },
  ],
}

// URL base del widget Investing.com — i parametri vengono ricostruiti dinamicamente
const INVESTING_CALENDAR_BASE = 'https://sslecal2.investing.com'

const STOCK_HEATMAP_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js'
const STOCK_HEATMAP_CONFIG = {
  colorTheme: 'dark', dataSource: 'SPX500', grouping: 'sector',
  blockSize: 'market_cap_basic', blockColor: 'change',
  hasTopBar: true, isDataSetEnabled: true,
  locale: 'it', width: '100%', height: '100%',
}

const CRYPTO_HEATMAP_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js'
const CRYPTO_HEATMAP_CONFIG = {
  colorTheme: 'dark', dataSource: 'Crypto',
  blockSize: 'market_cap_calc', blockColor: 'change',
  locale: 'it', width: '100%', height: '100%',
}

const FOREX_HEATMAP_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js'
const FOREX_HEATMAP_CONFIG = {
  colorTheme: 'dark', isTransparent: false, locale: 'it',
  currencies: ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD'],
  width: '100%', height: '100%',
}


// ── Componenti UI ─────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onSelect }) {
  return (
    <div className="flex gap-1 mb-5 border-b border-slate-800 overflow-x-auto">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px
            ${active === id
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function WidgetCard({ title, hint, children }) {
  return (
    <div className="rounded-3xl border border-card-border bg-card p-4 shadow-xl overflow-hidden" style={{ height: '620px' }}>
      <h2 className="mb-1 text-base font-semibold text-slate-200">{title}</h2>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      <div style={{ height: hint ? 'calc(100% - 3.2rem)' : 'calc(100% - 2rem)' }}>
        {children}
      </div>
    </div>
  )
}

// ── Tab Heatmap ───────────────────────────────────────────────────────────────

const HEATMAP_SUBTABS = [
  { id: 'azioni', label: 'Azioni' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'forex',  label: 'Forex' },
]

function HeatmapTab() {
  const [sub, setSub] = useState('azioni')

  const stockConfig  = useMemo(() => STOCK_HEATMAP_CONFIG, [])
  const cryptoConfig = useMemo(() => CRYPTO_HEATMAP_CONFIG, [])
  const forexConfig  = useMemo(() => FOREX_HEATMAP_CONFIG, [])

  return (
    <>
      <TabBar tabs={HEATMAP_SUBTABS} active={sub} onSelect={setSub} />
      {sub === 'azioni' && (
        <WidgetCard title="Heatmap Azioni" hint="Puoi cambiare indice (S&P500, Nasdaq, DAX, FTSE MIB…) dalla barra in alto nel widget.">
          <TradingViewWidget scriptSrc={STOCK_HEATMAP_SRC} config={stockConfig} />
        </WidgetCard>
      )}
      {sub === 'crypto' && (
        <WidgetCard title="Heatmap Crypto">
          <TradingViewWidget scriptSrc={CRYPTO_HEATMAP_SRC} config={cryptoConfig} />
        </WidgetCard>
      )}
      {sub === 'forex' && (
        <WidgetCard title="Forex Cross Rates">
          <TradingViewWidget scriptSrc={FOREX_HEATMAP_SRC} config={forexConfig} />
        </WidgetCard>
      )}
    </>
  )
}

// ── Tab News (feed RSS italiani) ──────────────────────────────────────────────

const NEWS_SUBTABS = [
  { id: 'mercati',  label: 'Mercati' },
  { id: 'economia', label: 'Economia' },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function NewsCard({ item }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-card-border bg-card-inner p-4 hover:border-cyan-700/60 hover:bg-card-inner/80 transition group"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-semibold text-cyan-400">{item.source}</span>
        <span className="text-xs text-slate-500 shrink-0">{formatDate(item.publishedAt)}</span>
      </div>
      <div className="text-sm font-medium text-slate-200 group-hover:text-white leading-snug">{item.title}</div>
      {item.summary && (
        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.summary}</p>
      )}
    </a>
  )
}

function NewsTab() {
  const [sub, setSub] = useState('mercati')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setItems([])
    api.getNews(sub)
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || 'Errore caricamento notizie'))
      .finally(() => setLoading(false))
  }, [sub])

  return (
    <>
      <TabBar tabs={NEWS_SUBTABS} active={sub} onSelect={setSub} />
      <WidgetCard title="News in italiano" hint="Fonti: testate finanziarie italiane (feed RSS pubblici)">
        <div className="h-full overflow-y-auto space-y-2 pr-1">
          {loading && (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">Caricamento notizie…</div>
          )}
          {!loading && error && (
            <div className="flex items-center justify-center h-full text-red-400 text-sm">{error}</div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">Nessuna notizia disponibile.</div>
          )}
          {!loading && items.map((item, i) => (
            <NewsCard key={item.link || i} item={item} />
          ))}
        </div>
      </WidgetCard>
    </>
  )
}

// ── Tab Calendario (Investing.com) ────────────────────────────────────────────

const CALENDAR_FILTERS = [
  { label: 'Alta importanza', importance: '2' },
  { label: 'Media e alta',    importance: '1,2' },
  { label: 'Tutte',           importance: '-1,0,1,2' },
]

function CalendarioTab() {
  const [filterIdx, setFilterIdx] = useState(0)

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      featured: '1',
      importance: CALENDAR_FILTERS[filterIdx].importance,
      lang: '24',
      timezone: '55',
      timeframe: 'today',
    })
    return `${INVESTING_CALENDAR_BASE}?${params.toString()}`
  }, [filterIdx])

  return (
    <WidgetCard title="Calendario economico" hint="Fonte: Investing.com — i filtri per paese sono selezionabili direttamente nel widget.">
      <div className="flex gap-2 mb-3 flex-wrap">
        {CALENDAR_FILTERS.map((f, i) => (
          <button
            key={f.label}
            onClick={() => setFilterIdx(i)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition
              ${filterIdx === i
                ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div style={{ height: 'calc(100% - 2.5rem)' }}>
        <iframe
          src={iframeSrc}
          title="Calendario economico Investing.com"
          width="100%"
          height="100%"
          frameBorder="0"
          allowTransparency="true"
          style={{ border: 0 }}
        />
      </div>
    </WidgetCard>
  )
}

// ── Schede principali ─────────────────────────────────────────────────────────

const MAIN_TABS = [
  { id: 'grafico',    label: 'Grafico' },
  { id: 'panoramica', label: 'Panoramica' },
  { id: 'heatmap',    label: 'Heatmap' },
  { id: 'news',       label: 'News' },
  { id: 'calendario', label: 'Calendario' },
]

// ── Pagina Trading Live ───────────────────────────────────────────────────────

export default function TradingLive() {
  const { theme } = useTheme()
  const bgColor = theme === 'green' ? '#050f0a' : '#0d1117'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('grafico')
  const navigate = useNavigate()

  const chartConfig    = useMemo(() => ADVANCED_CHART_CONFIG, [])
  const overviewConfig = useMemo(() => MARKET_OVERVIEW_CONFIG, [])

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100" style={{ background: bgColor }}>
      <AnimatedBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10">
      <div className="p-5">
        <header className="mb-5 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Torna indietro"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Apri menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Trading Live</h1>
            <p className="text-sm text-slate-400">Panoramica in tempo reale · dati TradingView</p>
          </div>
        </header>

        <TabBar tabs={MAIN_TABS} active={activeTab} onSelect={setActiveTab} />

        {activeTab === 'grafico' && (
          <WidgetCard
            title="Grafico avanzato"
            hint="Puoi cambiare simbolo, timeframe e fare login al tuo account TradingView direttamente dentro il grafico."
          >
            <TradingViewWidget scriptSrc={ADVANCED_CHART_SRC} config={chartConfig} />
          </WidgetCard>
        )}

        {activeTab === 'panoramica' && (
          <WidgetCard title="Panoramica mercati">
            <TradingViewWidget scriptSrc={MARKET_OVERVIEW_SRC} config={overviewConfig} />
          </WidgetCard>
        )}

        {activeTab === 'heatmap' && <HeatmapTab />}

        {activeTab === 'news' && <NewsTab />}

        {activeTab === 'calendario' && <CalendarioTab />}
      </div>
      </div>
    </div>
  )
}
