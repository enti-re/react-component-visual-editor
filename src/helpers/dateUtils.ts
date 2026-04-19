const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24

export const formatRelativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / MS_PER_MINUTE)
  if (m < 1) return 'just now'
  if (m < MINUTES_PER_HOUR) return `${m}m ago`
  const h = Math.floor(m / MINUTES_PER_HOUR)
  if (h < HOURS_PER_DAY) return `${h}h ago`
  return `${Math.floor(h / HOURS_PER_DAY)}d ago`
}
