import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import TradingViewWidget from '../components/markets/TradingViewWidget.jsx'

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

const EVENTS_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-events.js'
const EVENTS_CONFIG = {
  colorTheme: 'dark', isTransparent: false, width: '100%', height: '100%',
  locale: 'it', importanceFilter: '0,1', countryFilter: 'us,eu,it,gb,jp,de,fr',
}

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

const NEWS_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'

const makeNewsConfig = (market) => ({
  colorTheme: 'dark', isTransparent: false, displayMode: 'regular',
  locale: 'it', width: '100%', height: '100%',
  feedMode: 'market', market,
})

const NEWS_STOCKS_CONFIG  = makeNewsConfig('stock')
const NEWS_FOREX_CONFIG   = makeNewsConfig('forex')
const NEWS_CRYPTO_CONFIG  = makeNewsConfig('crypto')
const NEWS_MACRO_CONFIG   = {
  colorTheme: 'dark', isTransparent: false, displayMode: 'regular',
  locale: 'it', width: '100%', height: '100%',
  feedMode: 'all_symbols',
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
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl overflow-hidden" style={{ height: '620px' }}>
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

// ── Tab News ──────────────────────────────────────────────────────────────────

const NEWS_SUBTABS = [
  { id: 'azioni', label: 'Azioni' },
  { id: 'forex',  label: 'Forex' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'macro',  label: 'Macro' },
]

function NewsTab() {
  const [sub, setSub] = useState('azioni')

  const stocksConfig = useMemo(() => NEWS_STOCKS_CONFIG, [])
  const forexConfig  = useMemo(() => NEWS_FOREX_CONFIG, [])
  const cryptoConfig = useMemo(() => NEWS_CRYPTO_CONFIG, [])
  const macroConfig  = useMemo(() => NEWS_MACRO_CONFIG, [])

  return (
    <>
      <TabBar tabs={NEWS_SUBTABS} active={sub} onSelect={setSub} />
      {sub === 'azioni' && (
        <WidgetCard title="News Azioni">
          <TradingViewWidget scriptSrc={NEWS_SRC} config={stocksConfig} />
        </WidgetCard>
      )}
      {sub === 'forex' && (
        <WidgetCard title="News Forex">
          <TradingViewWidget scriptSrc={NEWS_SRC} config={forexConfig} />
        </WidgetCard>
      )}
      {sub === 'crypto' && (
        <WidgetCard title="News Crypto">
          <TradingViewWidget scriptSrc={NEWS_SRC} config={cryptoConfig} />
        </WidgetCard>
      )}
      {sub === 'macro' && (
        <WidgetCard title="News Macro" hint="Feed generale multi-mercato (market:'economy' non supportato dal widget Timeline).">
          <TradingViewWidget scriptSrc={NEWS_SRC} config={macroConfig} />
        </WidgetCard>
      )}
    </>
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('grafico')
  const navigate = useNavigate()

  const chartConfig    = useMemo(() => ADVANCED_CHART_CONFIG, [])
  const overviewConfig = useMemo(() => MARKET_OVERVIEW_CONFIG, [])
  const eventsConfig   = useMemo(() => EVENTS_CONFIG, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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

        {activeTab === 'calendario' && (
          <WidgetCard title="Calendario economico">
            <TradingViewWidget scriptSrc={EVENTS_SRC} config={eventsConfig} />
          </WidgetCard>
        )}
      </div>
    </div>
  )
}
