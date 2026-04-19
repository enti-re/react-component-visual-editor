import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

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

  const { data, error } = await supabase
    .from('components')
    .update({ code, updated_at: new Date().toISOString() })
    .eq('id', req.query.id as string)
    .select()
    .single()

  if (error || !data) {
    res.status(404).json({ error: error?.message ?? 'Component not found' })
    return
  }
  res.json({ id: data.id, code: data.code, createdAt: data.created_at, updatedAt: data.updated_at })
}
