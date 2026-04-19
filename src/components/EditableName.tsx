import { useState, useEffect, useRef } from 'react'
import { PencilIcon } from './icons'

interface EditableNameProps {
  name: string
  onChange: (name: string) => void
}

export const EditableName = ({ name, onChange }: EditableNameProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(name) }, [name])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim() || name
    setDraft(trimmed)
    if (trimmed !== name) onChange(trimmed)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="editor-name-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); inputRef.current?.blur() }
          if (e.key === 'Escape') { setDraft(name); setEditing(false) }
        }}
        autoFocus
        spellCheck={false}
      />
    )
  }

  return (
    <button className="editor-name-btn" onClick={() => setEditing(true)} title="Rename component">
      <span>{name}</span>
      <PencilIcon />
    </button>
  )
}
