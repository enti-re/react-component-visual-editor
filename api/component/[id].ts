import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
})

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { code } = req.body as { code?: unknown }
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'code is required' })
    return
  }

  const { rows } = await pool.query(
    `UPDATE components SET code = $1, updated_at = NOW() WHERE id = $2 RETURNING id, code, created_at, updated_at`,
    [code, req.query.id]
  )
  if (!rows.length) {
    res.status(404).json({ error: 'Component not found' })
    return
  }
  const r = rows[0]
  res.json({ id: r.id, code: r.code, createdAt: r.created_at, updatedAt: r.updated_at })
}
