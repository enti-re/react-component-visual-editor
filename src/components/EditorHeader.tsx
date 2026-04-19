import { EditableName } from './EditableName'
import { RecentsMenu } from './RecentsMenu'
import { SaveButton } from './SaveButton'
import { ShareButton } from './ShareButton'
import { KbdTooltip, tooltipHandlers } from './KbdTooltip'
import { InspectorIcon } from './icons'
import type { ComponentMeta, SaveState } from '../types'

interface EditorHeaderProps {
  meta: ComponentMeta
  onMetaChange: (updater: (m: ComponentMeta) => ComponentMeta) => void
  selectMode: boolean
  onToggleSelectMode: () => void
  saveState: SaveState
  onSave: () => void
  onRevert: () => void
  onNew: () => void
  onLoadRecent: (id: string) => void
  onCopyLink: () => void
}

export const EditorHeader = ({
  meta,
  onMetaChange,
  selectMode,
  onToggleSelectMode,
  saveState,
  onSave,
  onRevert,
  onNew,
  onLoadRecent,
  onCopyLink,
}: EditorHeaderProps) => (
  <>
    <KbdTooltip />
    <header className="editor-header">
      <div className="editor-logo">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        <span className="editor-logo-text">Visual Editor</span>
        <span className="editor-logo-sep">/</span>
        <EditableName name={meta.name} onChange={name => onMetaChange(m => ({ ...m, name }))} />
      </div>

      <div className="editor-header-actions">
        <div className="editor-action-group">
          <button
            className={`editor-ghost-btn editor-inspect-btn ${selectMode ? 'editor-inspect-btn--active' : ''}`}
            onClick={onToggleSelectMode}
            {...tooltipHandlers(selectMode ? 'Stop inspecting' : 'Inspect element', '', 'bottom')}
          >
            <InspectorIcon />
          </button>
        </div>

        <div className="editor-action-divider" />

        <div className="editor-action-group">
          <button
            className="editor-ghost-btn"
            onClick={onRevert}
            disabled={!saveState.isDirty}
            {...tooltipHandlers('Revert changes', '', 'bottom')}
          >
            Revert
          </button>
          <SaveButton status={saveState.status} isDirty={saveState.isDirty} onClick={onSave} />
        </div>

        <div className="editor-action-divider" />

        <div className="editor-action-group">
          <RecentsMenu onLoad={onLoadRecent} currentId={meta.id} />
          <button
            className="editor-ghost-btn"
            onClick={onNew}
            {...tooltipHandlers('New component', '', 'bottom')}
          >
            New
          </button>
          {meta.id && <ShareButton onClick={onCopyLink} />}
        </div>
      </div>
    </header>
  </>
)
