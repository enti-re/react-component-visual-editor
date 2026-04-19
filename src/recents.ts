import { extractLabel } from './helpers/labelUtils'

const STORAGE_KEY = 'editor-recents'
const MAX_RECENTS = 8

export interface RecentEntry {
  id: string
  label: string
  savedAt: string
}

export const getRecents = (): RecentEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export const pushRecent = (id: string, code: string, label?: string): void => {
  const resolvedLabel = label ?? extractLabel(code)
  const entry: RecentEntry = { id, label: resolvedLabel, savedAt: new Date().toISOString() }
  const existing = getRecents().filter(r => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing].slice(0, MAX_RECENTS)))
}
