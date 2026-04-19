import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, toResponse, type ComponentRow } from '../_db'

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const pool = getPool()
  const { rows } = await pool.query<ComponentRow>(
    `SELECT * FROM components WHERE id = $1`,
    [req.query.id]
  )
  if (!rows.length) {
    res.status(404).json({ error: 'Component not found' })
    return
  }
  res.json(toResponse(rows[0]))
}
