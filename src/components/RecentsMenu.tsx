import { useState, useEffect, useRef } from 'react'
import { getRecents } from '../recents'
import { formatRelativeTime } from '../helpers/dateUtils'

interface RecentsMenuProps {
  onLoad: (id: string) => void
  currentId: string | null
}

export const RecentsMenu = ({ onLoad, currentId }: RecentsMenuProps) => {
  const [open, setOpen] = useState(false)
  const [recents, setRecents] = useState(getRecents)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { if (open) setRecents(getRecents()) }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (recents.length === 0) return null

  return (
    <div className="editor-more-wrap" ref={ref}>
      <button className="editor-ghost-btn" onClick={() => setOpen(v => !v)}>Recent</button>
      {open && (
        <div className="editor-more-menu">
          {recents.map(r => (
            <button
              key={r.id}
              className={`editor-more-item editor-recent-item${r.id === currentId ? ' editor-recent-item--active' : ''}`}
              onClick={() => { onLoad(r.id); setOpen(false) }}
            >
              <span className="editor-recent-label">{r.label}</span>
              <span className="editor-recent-time">{formatRelativeTime(r.savedAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
