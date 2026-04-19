import { useState, useCallback } from 'react'
import { pushRecent } from '../recents'
import { extractLabel } from '../helpers/labelUtils'
import { createComponent, updateComponent, getComponent } from '../api'
import { setComponentIdInUrl, removeComponentIdFromUrl } from '../helpers/urlParams'
import { updateNodeInCode } from '../utils/astUtils'
import type { SelectedNode, InitialComponent, SaveState, ComponentMeta } from '../types'

export const useEditorSession = (initial: InitialComponent, onReset: (code?: string, id?: string | null) => void) => {
  const [code, setCode] = useState(initial.code)
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [selectMode, setSelectMode] = useState(false)

  const [saveState, setSaveState] = useState<SaveState>({
    status: 'idle',
    isDirty: false,
    savedCode: initial.code,
  })

  const [meta, setMeta] = useState<ComponentMeta>({
    id: initial.id,
    name: extractLabel(initial.code),
  })

  const handleSave = useCallback(async () => {
    setSaveState(s => ({ ...s, status: 'saving' }))
    try {
      let id: string
      if (meta.id) {
        await updateComponent(meta.id, code)
        id = meta.id
      } else {
        const created = await createComponent(code)
        id = created.id
        setMeta(m => ({ ...m, id }))
        setComponentIdInUrl(id)
      }
      setSaveState({ status: 'saved', isDirty: false, savedCode: code })
      pushRecent(id, code, meta.name)
      setTimeout(() => setSaveState(s => ({ ...s, status: 'idle' })), 2000)
    } catch {
      setSaveState(s => ({ ...s, status: 'error' }))
      setTimeout(() => setSaveState(s => ({ ...s, status: 'idle' })), 3000)
    }
  }, [code, meta])

  const handleRevert = useCallback(() => {
    setCode(saveState.savedCode)
    setSaveState(s => ({ ...s, isDirty: false }))
  }, [saveState.savedCode])

  const handleNew = useCallback(() => {
    if (saveState.isDirty && !window.confirm('You have unsaved changes. Start fresh anyway?')) return
    removeComponentIdFromUrl()
    onReset()
  }, [saveState.isDirty, onReset])

  const handleLoadRecent = useCallback(async (id: string) => {
    try {
      const record = await getComponent(id)
      setComponentIdInUrl(record.id)
      onReset(record.code, record.id)
    } catch {
      alert('Could not load component — it may have been deleted.')
    }
  }, [onReset])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
  }, [])

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
    setSelectedNode(null)
    setSaveState(s => ({ ...s, isDirty: true }))
  }, [])

  const toggleInspectMode = useCallback(() => {
    setSelectMode(v => {
      if (v) setSelectedNode(null)
      return !v
    })
  }, [])

  const handlePropertyChange = useCallback((property: string, value: string) => {
    if (!selectedNode) return
    const newCode = updateNodeInCode(code, selectedNode.id, property, value)
    if (newCode) {
      setCode(newCode)
      setSaveState(s => ({ ...s, isDirty: true }))
      setSelectedNode(prev => {
        if (!prev) return null
        if (property === 'text') return { ...prev, text: value }
        return { ...prev, style: { ...prev.style, [property]: value } }
      })
    }
  }, [code, selectedNode])

  return {
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
    handlePropertyChange,
  }
}
