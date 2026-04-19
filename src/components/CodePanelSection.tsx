import { CodePanel } from './CodePanel'
import { ChevronIcon } from './icons'
import { tooltipHandlers, shortcutLabel } from './KbdTooltip'
import type { PanelState, PanelSide } from '../types'

interface CodePanelSectionProps {
  panels: PanelState
  onPanelsChange: (updater: (p: PanelState) => PanelState) => void
  code: string
  onCodeChange: (code: string) => void
  onDragStart: (side: PanelSide) => (e: React.MouseEvent) => void
}

export const CodePanelSection = ({ panels, onPanelsChange, code, onCodeChange, onDragStart }: CodePanelSectionProps) => {
  
  if (panels.codeCollapsed) {
    return (
      <button
        className="panel-rail panel-rail--left"
        onClick={() => onPanelsChange(panels => ({ ...panels, codeCollapsed: false }))}
        {...tooltipHandlers('Expand code', shortcutLabel('['), 'right')}
      >
        <ChevronIcon dir="right" />
        <span>Code</span>
      </button>
    )
  }

  return (
    <>
      <div className="editor-panel editor-panel--code" style={{ flex: `0 0 ${panels.codeWidth}px` }}>
        <div className="panel-label">
          <span>Code</span>
          <button
            className="panel-collapse-btn"
            onClick={() => onPanelsChange(panels => ({ ...panels, codeCollapsed: true }))}
            {...tooltipHandlers('Collapse', shortcutLabel('['), 'bottom')}
          >
            <ChevronIcon dir="left" />
          </button>
        </div>
        <CodePanel code={code} onChange={onCodeChange} />
      </div>
      <div className="panel-resizer" onMouseDown={onDragStart('left')} role="separator" aria-orientation="vertical" />
    </>
  )
}
