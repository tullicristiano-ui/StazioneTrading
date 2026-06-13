import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'

// ── Canvas animato ────────────────────────────────────────────────────────────

function AnimatedBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const particles = []
    const COUNT = 70

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function initParticles() {
      particles.length = 0
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x:       Math.random() * canvas.width,
          y:       Math.random() * canvas.height,
          vx:      (Math.random() - 0.5) * 0.8,
          vy:      (Math.random() - 0.5) * 0.8,
          opacity: 0.2 + Math.random() * 0.3,
          radius:  1.5 + Math.random(),
        })
      }
    }

    let rafId
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16,185,129,${p.opacity})`
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.25
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(20,184,166,${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(() => {
      resize()
      initParticles()
    })
    observer.observe(canvas.parentElement)

    resize()
    initParticles()
    draw()

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}

// ── Icona candela SVG ─────────────────────────────────────────────────────────

function CandleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Miccia superiore */}
      <line x1="24" y1="2" x2="24" y2="10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      {/* Corpo verde (rialzista) */}
      <rect x="16" y="10" width="16" height="22" rx="2" fill="#10b981" />
      {/* Miccia inferiore */}
      <line x1="24" y1="32" x2="24" y2="46" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      {/* Piccolo rettangolo rosso sotto per richiamare la candela ribassista */}
      <rect x="19" y="38" width="10" height="6" rx="1" fill="#ef4444" opacity="0.7" />
    </svg>
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

export default function Markets() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div
      className="relative min-h-screen overflow-hidden text-slate-100"
      style={{ background: '#050f0a' }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Hamburger */}
        <header className="p-4">
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
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

          <CandleIcon />

          <h1 className="mt-6 text-6xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Stazione di Trading
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300 text-lg leading-relaxed">
            Il tuo spazio di lavoro personale per analizzare i mercati finanziari con l'aiuto dell'intelligenza artificiale.
            Carica i grafici, discuti la struttura del mercato con l'agente Aware Trader e tieni traccia di ogni operazione nel journal.
            Tutto sul tuo computer, sempre disponibile.
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
