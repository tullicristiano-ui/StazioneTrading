import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, allQuery } from '../db/database.js'

const router = express.Router()

const now = () => new Date().toISOString()

function quoteCsv(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const text = String(value).replace(/"/g, '""')
  return `"${text}"`
}

router.get('/', async (req, res, next) => {
  try {
    const sessionId = req.query.session_id
    const query = sessionId
      ? 'SELECT * FROM journal_entries WHERE session_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM journal_entries ORDER BY created_at DESC'
    const params = sessionId ? [sessionId] : []
    const entries = await allQuery(query, params)
    res.json(entries)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const values = req.body || {}
    const id = uuidv4()
    const createdAt = now()

    const params = [
      id,
      values.session_id || null,
      createdAt,
      JSON.stringify(values),
      values.ora || null,
      values.asset || null,
      values.timeframe || null,
      values.bias || null,
      values.setup || null,
      values.modalita || null,
      values.entry || null,
      values.stop_loss || null,
      values.take_profit_1 || null,
      values.take_profit_2 || null,
      values.risk_reward || null,
      values.size || null,
      values.decisione_agente || null,
      values.decisione_trader || null,
      values.esito || null,
      values.durata_trade || null,
      values.nota || null,
      values.screenshot_link || null,
      values.csv_row || null
    ]

    await runQuery(
      'INSERT INTO journal_entries (id, session_id, created_at, data, ora, asset, timeframe, bias, setup, modalita, entry, stop_loss, take_profit_1, take_profit_2, risk_reward, size, decisione_agente, decisione_trader, esito, durata_trade, nota, screenshot_link, csv_row) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params
    )

    res.status(201).json({ id, created_at: createdAt, ...values })
  } catch (err) {
    next(err)
  }
})

router.get('/export.csv', async (req, res, next) => {
  try {
    const entries = await allQuery('SELECT * FROM journal_entries ORDER BY created_at DESC')
    const columns = [
      'id',
      'session_id',
      'created_at',
      'data',
      'ora',
      'asset',
      'timeframe',
      'bias',
      'setup',
      'modalita',
      'entry',
      'stop_loss',
      'take_profit_1',
      'take_profit_2',
      'risk_reward',
      'size',
      'decisione_agente',
      'decisione_trader',
      'esito',
      'durata_trade',
      'nota',
      'screenshot_link',
      'csv_row'
    ]

    const csvRows = [columns.join(',')]
    entries.forEach((entry) => {
      const row = columns.map((key) => quoteCsv(entry[key])).join(',')
      csvRows.push(row)
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="journal_entries.csv"')
    res.send(csvRows.join('\r\n'))
  } catch (err) {
    next(err)
  }
})

export default router
