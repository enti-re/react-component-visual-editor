import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
})

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { rows } = await pool.query(
    `SELECT * FROM components WHERE id = $1`,
    [req.query.id]
  )
  if (!rows.length) {
    res.status(404).json({ error: 'Component not found' })
    return
  }
  const r = rows[0]
  res.json({ id: r.id, code: r.code, createdAt: r.created_at, updatedAt: r.updated_at })
}
