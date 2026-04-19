import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
})

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { code } = req.body as { code?: unknown }
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'code is required' })
    return
  }

  const id = randomUUID()
  const { rows } = await pool.query(
    `INSERT INTO components (id, code) VALUES ($1, $2) RETURNING id`,
    [id, code]
  )
  res.status(201).json({ id: rows[0].id })
}
