import express from 'express'
import Parser from 'rss-parser'

const router = express.Router()
// User-Agent "da browser": alcune testate rifiutano richieste senza UA.
const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
})

// Cache in memoria: { key: { data, expiresAt } }
const cache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

// Feed RSS italiani verificati e funzionanti (giugno 2026).
// Se una testata cambia URL, il feed va aggiornato qui.
const FEEDS = {
  mercati: [
    { url: 'https://www.wallstreetitalia.com/feed/',                          source: 'Wall Street Italia' },
    { url: 'https://it.investing.com/rss/news_25.rss',                        source: 'Investing.com — Mercati' },
    { url: 'https://www.money.it/spip.php?page=backend',                      source: 'Money.it' },
  ],
  economia: [
    { url: 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml',     source: 'ANSA — Economia' },
    { url: 'https://www.corriere.it/rss/economia.xml',                        source: 'Corriere della Sera — Economia' },
    { url: 'https://www.repubblica.it/rss/economia/rss2.0.xml',              source: 'Repubblica — Economia' },
  ],
}

async function fetchFeed(feedDef) {
  try {
    const feed = await parser.parseURL(feedDef.url)
    return (feed.items || []).slice(0, 15).map(item => ({
      title:       item.title?.trim() || '',
      link:        item.link || item.guid || '',
      source:      feedDef.source,
      publishedAt: item.isoDate || item.pubDate || '',
      summary:     item.contentSnippet?.trim() || item.content?.replace(/<[^>]+>/g, '').trim().slice(0, 200) || '',
    }))
  } catch {
    // Feed irraggiungibile o malformato: lo ignoriamo, gli altri continuano.
    return []
  }
}

router.get('/', async (req, res, next) => {
  try {
    const category = req.query.category || 'mercati'
    const feedDefs = FEEDS[category] || FEEDS.mercati
    const cacheKey = category

    const cached = cache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      return res.json(cached.data)
    }

    const results = await Promise.all(feedDefs.map(fetchFeed))
    const items = results
      .flat()
      .filter(i => i.title && i.link)
      .sort((a, b) => {
        const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return db - da
      })
      .slice(0, 40)

    cache.set(cacheKey, { data: items, expiresAt: Date.now() + CACHE_TTL_MS })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

export default router
