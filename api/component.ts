import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'crypto'
import { getPool, toResponse, type ComponentRow } from './_db.js'

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

  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS components (
      id         TEXT PRIMARY KEY,
      code       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const id = randomUUID()
  const { rows } = await pool.query<ComponentRow>(
    `INSERT INTO components (id, code) VALUES ($1, $2) RETURNING *`,
    [id, code]
  )
  res.status(201).json({ id: rows[0].id })
}
