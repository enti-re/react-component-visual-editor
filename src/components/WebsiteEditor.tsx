import { useCallback, useRef } from 'react'
import { usePanelResize } from '../hooks/usePanelResize'
import { useEditorSession } from '../hooks/useEditorSession'
import type { InitialComponent } from '../types'
import { EditorHeader } from './EditorHeader'
import { CodePanelSection } from './CodePanelSection'
import { PreviewPanelSection } from './PreviewPanelSection'
import { PropertiesPanelSection } from './PropertiesPanelSection'
import '../styles/editor.css'

interface WebsiteEditorProps {
  initial: InitialComponent
  onReset: (code?: string, id?: string | null) => void
}

export const WebsiteEditor = ({ initial, onReset }: WebsiteEditorProps) => {
  const { panels, setPanels, bodyRef, onDragStart } = usePanelResize()
  const {
    code,
    meta,
    setMeta,
    saveState,
    selectMode,
    selectedNode,
    setSelectedNode,
    handleSave,
    handleRevert,
    handleNew,
    handleLoadRecent,
    handleCopyLink,
    handleCodeChange,
    toggleInspectMode,
    handlePropertyChange: updatePropertyInCode,
  } = useEditorSession(initial, onReset)

  const previewPatchRef = useRef<((editorId: string, property: string, value: string) => void) | null>(null)

  const handlePropertyChange = useCallback((property: string, value: string) => {
    if (selectedNode) previewPatchRef.current?.(selectedNode.id, property, value)
    updatePropertyInCode(property, value)
  }, [selectedNode, updatePropertyInCode])

  return (
    <div className="editor-root">
      <EditorHeader
        meta={meta}
        onMetaChange={setMeta}
        selectMode={selectMode}
        onToggleSelectMode={toggleInspectMode}
        saveState={saveState}
        onSave={handleSave}
        onRevert={handleRevert}
        onNew={handleNew}
        onLoadRecent={handleLoadRecent}
        onCopyLink={handleCopyLink}
      />
      <div className="editor-body" ref={bodyRef}>
        <CodePanelSection
          panels={panels}
          onPanelsChange={setPanels}
          code={code}
          onCodeChange={handleCodeChange}
          onDragStart={onDragStart}
        />
        <PreviewPanelSection
          panels={panels}
          onPanelsChange={setPanels}
          code={code}
          selectMode={selectMode}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          patchRef={previewPatchRef}
        />
        <PropertiesPanelSection
          panels={panels}
          onPanelsChange={setPanels}
          selectedNode={selectedNode}
          selectMode={selectMode}
          onPropertyChange={handlePropertyChange}
          onDragStart={onDragStart}
        />
      </div>
    </div>
  )
}
