import { usePreviewPanel } from '../hooks/usePreviewPanel'
import { HoverHighlight } from './HoverHighlight'
import type { SelectedNode } from '../types'

interface PreviewPanelProps {
  code: string
  selectMode: boolean
  selectedNodeId: string | null
  onNodeSelect: (node: SelectedNode | null) => void
  patchRef?: React.MutableRefObject<((editorId: string, property: string, value: string) => void) | null>
}

export const PreviewPanel = ({ code, selectMode, selectedNodeId, onNodeSelect, patchRef }: PreviewPanelProps) => {
  const { mountRef, highlightRef, error, hoverBadge, hoverRect, selectBadge, isHoverDistinct } =
    usePreviewPanel({ code, selectMode, selectedNodeId, onNodeSelect }, { patchRef })

  return (
    <div className="preview-panel">
      {error ? (
        <div className="preview-error">
          <strong>Error</strong>
          <pre>{error}</pre>
        </div>
      ) : (
        <div className="preview-scroll">
          <div className={`preview-relative ${selectMode ? 'preview-relative--select' : ''}`}>
            <div ref={mountRef} className="preview-mount" />
            <div ref={highlightRef} className="preview-highlight" style={{ display: 'none' }} />
            {selectBadge && (
              <div className="preview-badge preview-badge--select" style={{ top: selectBadge.top, left: selectBadge.left }}>
                {selectBadge.tag}
              </div>
            )}
            {selectMode && hoverRect && <HoverHighlight rect={hoverRect} mountEl={mountRef.current} />}
            {selectMode && isHoverDistinct && (
              <div className="preview-badge preview-badge--hover" style={{ top: hoverBadge!.top, left: hoverBadge!.left }}>
                {hoverBadge!.tag}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
