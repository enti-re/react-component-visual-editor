import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, toResponse, type ComponentRow } from '../_db'

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

  const pool = getPool()
  const { rows } = await pool.query<ComponentRow>(
    `UPDATE components SET code = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [code, req.query.id]
  )
  if (!rows.length) {
    res.status(404).json({ error: 'Component not found' })
    return
  }
  res.json(toResponse(rows[0]))
}
