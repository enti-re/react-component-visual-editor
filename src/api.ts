const BASE = '/api'

export interface ComponentRecord {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

export const createComponent = async (code: string): Promise<{ id: string }> => {
  const res = await fetch(`${BASE}/component`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const getComponent = async (id: string): Promise<ComponentRecord> => {
  const res = await fetch(`${BASE}/preview/${id}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const updateComponent = async (id: string, code: string): Promise<ComponentRecord> => {
  const res = await fetch(`${BASE}/component/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
