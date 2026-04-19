import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Pool } from 'pg'

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
    })
    const result = await pool.query('SELECT 1 as ok')
    await pool.end()
    res.json({ ok: true, result: result.rows })
  } catch (e: any) {
    res.status(500).json({ error: e.message, stack: e.stack })
  }
}
