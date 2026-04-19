import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import pg from 'pg'

const { Pool } = pg

interface ComponentRow {
  id: string
  code: string
  created_at: string
  updated_at: string
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function initDb(): Promise<void> {
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

const toResponse = (r: ComponentRow) => ({
  id: r.id,
  code: r.code,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

app.post('/component', async (req: Request, res: Response) => {
  const { code } = req.body as { code?: unknown }
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'code is required' })
    return
  }
  const id = randomUUID()
  const { rows } = await pool.query<ComponentRow>(
    `INSERT INTO components (id, code) VALUES ($1, $2) RETURNING *`,
    [id, code]
  )
  res.status(201).json({ id: rows[0].id })
})

app.get('/preview/:id', async (req: Request, res: Response) => {
  const { rows } = await pool.query<ComponentRow>(
    `SELECT * FROM components WHERE id = $1`,
    [req.params.id]
  )
  if (!rows.length) {
    res.status(404).json({ error: 'Component not found' })
    return
  }
  res.json(toResponse(rows[0]))
})

app.put('/component/:id', async (req: Request, res: Response) => {
  const { code } = req.body as { code?: unknown }
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'code is required' })
    return
  }
  const { rows } = await pool.query<ComponentRow>(
    `UPDATE components SET code = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [code, req.params.id]
  )
  if (!rows.length) {
    res.status(404).json({ error: 'Component not found' })
    return
  }
  res.json(toResponse(rows[0]))
})

const PORT = process.env.PORT ?? 3002
initDb()
  .then(() => app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`)))
  .catch((err: Error) => { console.error('Failed to connect to database:', err.message); process.exit(1) })
