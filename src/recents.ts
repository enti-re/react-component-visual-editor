const KEY = 'editor-recents'
const MAX = 8

export interface RecentEntry {
  id: string
  label: string
  savedAt: string
}

export function getRecents(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function pushRecent(id: string, code: string, label?: string) {
  const resolvedLabel = label ?? extractLabel(code)
  const entry: RecentEntry = { id, label: resolvedLabel, savedAt: new Date().toISOString() }
  const existing = getRecents().filter(r => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify([entry, ...existing].slice(0, MAX)))
}

export function extractLabel(code: string): string {
  const match = code.match(/function\s+([A-Z][A-Za-z0-9_$]*)/) ??
                code.match(/const\s+([A-Z][A-Za-z0-9_$]*)/)
  return match?.[1] ?? 'Untitled'
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
