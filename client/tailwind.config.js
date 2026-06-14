/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Colori centralizzati delle card (indaco-prugna scuro): cambiando
        // qui si aggiorna lo sfondo/bordo di tutte le card dell'app.
        card: '#1d1a24',          // interno card (sostituisce bg-slate-900)
        'card-inner': '#16131c',  // card annidate (sostituisce bg-slate-950)
        'card-border': '#2a2533', // bordo card
      },
    },
  },
  plugins: [],
}
