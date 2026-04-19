import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS components (
      id         TEXT PRIMARY KEY,
      code       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  console.log('Database ready')
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

// POST /component
app.post('/component', async (req, res) => {
  const { code } = req.body
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code is required' })
  }
  const id = randomUUID()
  const { rows } = await pool.query(
    `INSERT INTO components (id, code) VALUES ($1, $2) RETURNING *`,
    [id, code]
  )
  res.status(201).json({ id: rows[0].id })
})

// GET /preview/:id
app.get('/preview/:id', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM components WHERE id = $1`,
    [req.params.id]
  )
  if (!rows.length) return res.status(404).json({ error: 'Component not found' })
  const r = rows[0]
  res.json({ id: r.id, code: r.code, createdAt: r.created_at, updatedAt: r.updated_at })
})

// PUT /component/:id
app.put('/component/:id', async (req, res) => {
  const { code } = req.body
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code is required' })
  }
  const { rows } = await pool.query(
    `UPDATE components SET code = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [code, req.params.id]
  )
  if (!rows.length) return res.status(404).json({ error: 'Component not found' })
  const r = rows[0]
  res.json({ id: r.id, code: r.code, createdAt: r.created_at, updatedAt: r.updated_at })
})

const PORT = process.env.PORT || 3002
initDb()
  .then(() => app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('Failed to connect to database:', err.message); process.exit(1) })
