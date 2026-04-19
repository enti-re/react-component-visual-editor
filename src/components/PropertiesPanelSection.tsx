import { PropertiesPanel } from './PropertiesPanel'
import { ChevronIcon } from './icons'
import { tooltipHandlers, shortcutLabel } from './KbdTooltip'
import type { PanelState, SelectedNode, PanelSide } from '../types'

interface PropertiesPanelSectionProps {
  panels: PanelState
  onPanelsChange: (updater: (p: PanelState) => PanelState) => void
  selectedNode: SelectedNode | null
  selectMode: boolean
  onPropertyChange: (property: string, value: string) => void
  onDragStart: (side: PanelSide) => (e: React.MouseEvent) => void
}

export const PropertiesPanelSection = ({ panels, onPanelsChange, selectedNode, selectMode, onPropertyChange, onDragStart }: PropertiesPanelSectionProps) => {
  if (panels.propsCollapsed) {
    return (
      <button
        className="panel-rail panel-rail--right"
        onClick={() => onPanelsChange(panels => ({ ...panels, propsCollapsed: false }))}
        {...tooltipHandlers('Expand properties', shortcutLabel(']'), 'left')}
      >
        <ChevronIcon dir="left" />
        <span>Properties</span>
      </button>
    )
  }

  return (
    <>
      <div className="panel-resizer" onMouseDown={onDragStart('right')} role="separator" aria-orientation="vertical" />
      <div className="editor-panel editor-panel--properties" style={{ flex: `0 0 ${panels.propsWidth}px` }}>
        <div className="panel-label">
          <div className="panel-label-group">
            <button
              className="panel-collapse-btn"
              onClick={() => onPanelsChange(panels => ({ ...panels, propsCollapsed: true }))}
              {...tooltipHandlers('Collapse', shortcutLabel(']'), 'bottom')}
            >
              <ChevronIcon dir="right" />
            </button>
            <span className="panel-label-title">Properties</span>
          </div>
        </div>
        <PropertiesPanel
          selectedNode={selectedNode}
          selectMode={selectMode}
          onPropertyChange={onPropertyChange}
        />
      </div>
    </>
  )
}
