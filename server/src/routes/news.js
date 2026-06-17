import express from 'express'
import Parser from 'rss-parser'

const router = express.Router()
const parser = new Parser({ timeout: 8000 })

// Cache in memoria: { key: { data, expiresAt } }
const cache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

const FEEDS = {
  mercati: [
    { url: 'https://www.ilsole24ore.com/rss/finanza--e-mercati.xml',         source: 'Il Sole 24 Ore — Mercati' },
    { url: 'https://www.milanofinanza.it/rss/news',                           source: 'Milano Finanza' },
    { url: 'https://www.borsaitaliana.it/borsa/notizie/rss.xml',             source: 'Borsa Italiana' },
  ],
  economia: [
    { url: 'https://www.ilsole24ore.com/rss/economia--e-finanza.xml',        source: 'Il Sole 24 Ore — Economia' },
    { url: 'https://www.corriere.it/rss/economia.xml',                        source: 'Corriere della Sera — Economia' },
    { url: 'https://www.repubblica.it/rss/economia/rss2.0.xml',              source: 'Repubblica — Economia' },
  ],
}

async function fetchFeed(feedDef) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const feed = await parser.parseURL(feedDef.url)
    clearTimeout(timer)
    return (feed.items || []).slice(0, 15).map(item => ({
      title:       item.title?.trim() || '',
      link:        item.link || item.guid || '',
      source:      feedDef.source,
      publishedAt: item.isoDate || item.pubDate || '',
      summary:     item.contentSnippet?.trim() || item.content?.replace(/<[^>]+>/g, '').trim().slice(0, 200) || '',
    }))
  } catch {
    return []
  } finally {
    clearTimeout(timer)
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
