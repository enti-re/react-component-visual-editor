import { PreviewPanel } from './PreviewPanel'
import { FullPreviewIcon } from './icons'
import { tooltipHandlers, shortcutLabel } from './KbdTooltip'
import type { PanelState, SelectedNode } from '../types'

interface PreviewPanelSectionProps {
  panels: PanelState
  onPanelsChange: (updater: (p: PanelState) => PanelState) => void
  code: string
  selectMode: boolean
  selectedNode: SelectedNode | null
  onNodeSelect: (node: SelectedNode | null) => void
  patchRef?: React.MutableRefObject<((editorId: string, property: string, value: string) => void) | null>
}

export const PreviewPanelSection = ({ panels, onPanelsChange, code, selectMode, selectedNode, onNodeSelect, patchRef }: PreviewPanelSectionProps) => {
  const isFullPreview = panels.codeCollapsed && panels.propsCollapsed

  const toggleFullPreview = () => {
    onPanelsChange(panels => {
      const next = !(panels.codeCollapsed && panels.propsCollapsed)
      return { ...panels, codeCollapsed: next, propsCollapsed: next }
    })
  }

  return (
    <div className="editor-panel editor-panel--preview">
      <div className="panel-label">
        <span>Preview</span>
        <button
          className="panel-collapse-btn"
          onClick={toggleFullPreview}
          {...tooltipHandlers(isFullPreview ? 'Exit full preview' : 'Full preview', shortcutLabel('\\'), 'bottom')}
        >
          <FullPreviewIcon expanded={isFullPreview} />
        </button>
      </div>
      <PreviewPanel
        code={code}
        selectMode={selectMode}
        selectedNodeId={selectedNode?.id ?? null}
        onNodeSelect={onNodeSelect}
        patchRef={patchRef}
      />
    </div>
  )
}
