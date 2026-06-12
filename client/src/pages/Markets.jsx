import { useState, useMemo } from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'
import TradingViewWidget from '../components/markets/TradingViewWidget.jsx'

const MARKET_OVERVIEW_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'

const MARKET_OVERVIEW_CONFIG = {
  colorTheme: 'dark',
  dateRange: '12M',
  showChart: true,
  locale: 'it',
  largeChartUrl: '',
  isTransparent: false,
  showSymbolLogo: true,
  showFloatingTooltip: false,
  width: '100%',
  height: '100%',
  tabs: [
    {
      title: 'Indici',
      symbols: [
        { s: 'FOREXCOM:SPXUSD', d: 'S&P 500 (US500)' },
        { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100 (US100)' },
        { s: 'INDEX:FTSEMIB', d: 'FTSE MIB' },
      ],
      originalTitle: 'Indices',
    },
    {
      title: 'Forex',
      symbols: [
        { s: 'FX:EURUSD', d: 'EUR/USD' },
        { s: 'FX:GBPUSD', d: 'GBP/USD' },
        { s: 'FX:USDJPY', d: 'USD/JPY' },
        { s: 'FX:USDCHF', d: 'USD/CHF' },
      ],
      originalTitle: 'Forex',
    },
    {
      title: 'Commodity',
      symbols: [
        { s: 'TVC:GOLD', d: 'Gold' },
        { s: 'TVC:SILVER', d: 'Silver' },
        { s: 'TVC:USOIL', d: 'Oil (WTI)' },
      ],
      originalTitle: 'Commodities',
    },
    {
      title: 'Crypto',
      symbols: [
        { s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' },
        { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' },
      ],
      originalTitle: 'Crypto',
    },
  ],
}

const EVENTS_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-events.js'

const EVENTS_CONFIG = {
  colorTheme: 'dark',
  isTransparent: false,
  width: '100%',
  height: '100%',
  locale: 'it',
  importanceFilter: '0,1',
  countryFilter: 'us,eu,it,gb,jp,de,fr',
}

const ADVANCED_CHART_SRC =
  'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'

const ADVANCED_CHART_CONFIG = {
  colorTheme: 'dark',
  locale: 'it',
  autosize: true,
  symbol: 'FOREXCOM:SPXUSD',
  interval: 'D',
  timezone: 'Europe/Rome',
  style: '1',
  allow_symbol_change: true,
  withdateranges: true,
  hide_side_toolbar: false,
  save_image: true,
}

export default function Markets() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const overviewConfig = useMemo(() => MARKET_OVERVIEW_CONFIG, [])
  const eventsConfig = useMemo(() => EVENTS_CONFIG, [])
  const chartConfig = useMemo(() => ADVANCED_CHART_CONFIG, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="p-5">
        {/* Header */}
        <header className="mb-6 flex items-center gap-4">
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
            <h1 className="text-2xl font-semibold">Mercati</h1>
            <p className="text-sm text-slate-400">Panoramica in tempo reale · dati TradingView</p>
          </div>
        </header>

        {/* Grafico avanzato — blocco principale a tutta larghezza */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl overflow-hidden mb-6" style={{ height: '600px' }}>
          <h2 className="mb-3 text-base font-semibold text-slate-200">Grafico avanzato</h2>
          <p className="mb-2 text-xs text-slate-500">Puoi cambiare simbolo, timeframe e fare login al tuo account TradingView direttamente dentro il grafico.</p>
          <div style={{ height: 'calc(100% - 3.5rem)' }}>
            <TradingViewWidget scriptSrc={ADVANCED_CHART_SRC} config={chartConfig} />
          </div>
        </div>

        {/* Griglia inferiore: Panoramica + Calendario */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Market Overview */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl overflow-hidden" style={{ height: '550px' }}>
            <h2 className="mb-3 text-base font-semibold text-slate-200">Panoramica mercati</h2>
            <div style={{ height: 'calc(100% - 2rem)' }}>
              <TradingViewWidget scriptSrc={MARKET_OVERVIEW_SRC} config={overviewConfig} />
            </div>
          </div>

          {/* Calendario economico */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl overflow-hidden" style={{ height: '550px' }}>
            <h2 className="mb-3 text-base font-semibold text-slate-200">Calendario economico</h2>
            <div style={{ height: 'calc(100% - 2rem)' }}>
              <TradingViewWidget scriptSrc={EVENTS_SRC} config={eventsConfig} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
