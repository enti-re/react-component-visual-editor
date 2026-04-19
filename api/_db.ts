import pg from 'pg'

const { Pool } = pg

let pool: pg.Pool | null = null

export const getPool = (): pg.Pool => {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
    })
  }
  return pool
}

export interface ComponentRow {
  id: string
  code: string
  created_at: string
  updated_at: string
}

export const toResponse = (r: ComponentRow) => ({
  id: r.id,
  code: r.code,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})
