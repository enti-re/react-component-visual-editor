import { useState, useRef, useCallback, useEffect } from 'react'
import type { PanelState, PanelSide } from '../types'

const MIN_CODE = 240
const MIN_PROPS = 220
const MIN_PREVIEW = 320

const DEFAULT_CODE_WIDTH = 480
const DEFAULT_PROPS_WIDTH = 300

export const usePanelResize = () => {
  const [panels, setPanels] = useState<PanelState>({
    codeWidth: DEFAULT_CODE_WIDTH,
    propsWidth: DEFAULT_PROPS_WIDTH,
    codeCollapsed: false,
    propsCollapsed: false,
  })

  const bodyRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ side: PanelSide; startX: number; startW: number } | null>(null)
  const panelsRef = useRef(panels)
  panelsRef.current = panels

  const onDragStart = (side: PanelSide) => (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { side, startX: e.clientX, startW: side === 'left' ? panels.codeWidth : panels.propsWidth }
    // document.body instead of a ref — drag moves freely across the whole page,
    // so cursor and text selection must be suppressed globally, not just within one element
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handlePanelResize = useCallback((e: MouseEvent) => {
    const drag = dragRef.current
    if (!drag || !bodyRef.current) return
    const p = panelsRef.current
    const total = bodyRef.current.clientWidth
    if (drag.side === 'left') {
      const next = drag.startW + (e.clientX - drag.startX)
      const maxW = total - (p.propsCollapsed ? 0 : p.propsWidth) - MIN_PREVIEW
      setPanels(prev => ({ ...prev, codeWidth: Math.max(MIN_CODE, Math.min(next, maxW)) }))
    } else {
      const next = drag.startW - (e.clientX - drag.startX)
      const maxW = total - (p.codeCollapsed ? 0 : p.codeWidth) - MIN_PREVIEW
      setPanels(prev => ({ ...prev, propsWidth: Math.max(MIN_PROPS, Math.min(next, maxW)) }))
    }
  }, [])

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current) return
    dragRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const handlePanelShortcuts = useCallback((e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    if (!mod) return
    if (e.key === '[') { e.preventDefault(); setPanels(p => ({ ...p, codeCollapsed: !p.codeCollapsed })) }
    else if (e.key === ']') { e.preventDefault(); setPanels(p => ({ ...p, propsCollapsed: !p.propsCollapsed })) }
    else if (e.key === '\\') {
      e.preventDefault()
      setPanels(p => {
        const both = p.codeCollapsed && p.propsCollapsed
        return { ...p, codeCollapsed: !both, propsCollapsed: !both }
      })
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handlePanelResize)
    window.addEventListener('mouseup', handleDragEnd)
    window.addEventListener('keydown', handlePanelShortcuts)
    return () => {
      window.removeEventListener('mousemove', handlePanelResize)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('keydown', handlePanelShortcuts)
    }
  }, [handlePanelResize, handleDragEnd, handlePanelShortcuts])

  return { panels, setPanels, bodyRef, onDragStart }
}
