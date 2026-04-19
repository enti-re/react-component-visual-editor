import type { SaveStatus } from '../types'

interface SaveButtonProps {
  status: SaveStatus
  isDirty: boolean
  onClick: () => void
}

export const SaveButton = ({ status, isDirty, onClick }: SaveButtonProps) => {
  const isSaving = status === 'saving'
  const label = isSaving ? 'Saving…' : status === 'saved' ? 'Saved' : status === 'error' ? 'Error' : 'Save'

  return (
    <div className="editor-save-wrap">
      <button
        className={`editor-save-btn${isDirty ? ' editor-save-btn--active' : ''}${isSaving ? ' editor-save-btn--saving' : ''}`}
        onClick={onClick}
        disabled={!isDirty || isSaving}
      >
        {isDirty && !isSaving && <span className="editor-save-dot" />}
        {label}
      </button>
    </div>
  )
}
