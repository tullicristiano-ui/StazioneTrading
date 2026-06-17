import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { runQuery, getQuery, allQuery } from '../db/database.js'

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

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const entry = await getQuery('SELECT id FROM journal_entries WHERE id = ?', [id])
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' })
    await runQuery('DELETE FROM journal_entries WHERE id = ?', [id])
    res.json({ ok: true, id })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const existing = await getQuery('SELECT * FROM journal_entries WHERE id = ?', [id])
    if (!existing) return res.status(404).json({ error: 'Journal entry not found' })

    const b = req.body || {}
    const fields = ['asset', 'timeframe', 'bias', 'setup', 'entry', 'stop_loss', 'take_profit_1', 'take_profit_2', 'risk_reward', 'size', 'esito', 'nota']

    const updated = {}
    fields.forEach(f => { updated[f] = b[f] ?? existing[f] })

    // Ricostruisce il campo data (JSON blob) unendo i valori esistenti con i nuovi
    let existingData = {}
    try { existingData = JSON.parse(existing.data || '{}') } catch {}
    const newData = JSON.stringify({ ...existingData, ...updated })

    await runQuery(
      `UPDATE journal_entries SET asset=?, timeframe=?, bias=?, setup=?, entry=?, stop_loss=?, take_profit_1=?, take_profit_2=?, risk_reward=?, size=?, esito=?, nota=?, data=? WHERE id=?`,
      [updated.asset, updated.timeframe, updated.bias, updated.setup, updated.entry, updated.stop_loss, updated.take_profit_1, updated.take_profit_2, updated.risk_reward, updated.size, updated.esito, updated.nota, newData, id]
    )

    const row = await getQuery('SELECT * FROM journal_entries WHERE id = ?', [id])
    res.json(row)
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
