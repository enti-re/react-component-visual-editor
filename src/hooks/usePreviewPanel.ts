import { useCallback, useEffect, useRef, useState } from 'react'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { extractNodeInfo } from '../utils/astUtils'
import { transpileCode, stripExports, findUserComponent } from '../utils/compilerUtils'
import { RENDER_DEBOUNCE_MS, EDITOR_ID_ATTR, EDITOR_ID_SELECTOR, ERROR_PARSE_FAILED, ERROR_TRANSPILE_FAILED, ERROR_NO_COMPONENT, ERROR_UNKNOWN } from '../utils/previewConstants'
import type { BadgeInfo, HoverInfo } from '../utils/previewTypes'
import type { SelectedNode } from '../types'

interface UsePreviewPanelProps {
  code: string
  selectMode: boolean
  selectedNodeId: string | null
  onNodeSelect: (node: SelectedNode | null) => void
}

const resolveElementAtClick = (target: HTMLElement, selectedNodeId: string | null): HTMLElement | null => {
  let el = target.closest(EDITOR_ID_SELECTOR) as HTMLElement | null
  if (el && el.getAttribute(EDITOR_ID_ATTR) === selectedNodeId) {
    el = el.parentElement?.closest(EDITOR_ID_SELECTOR) as HTMLElement | null ?? el
  }
  return el
}

const getBadgeInfo = (el: HTMLElement, containerRect: DOMRect): BadgeInfo => {
  const rect = el.getBoundingClientRect()
  return {
    tag: el.tagName.toLowerCase(),
    top: rect.top - containerRect.top,
    left: rect.left - containerRect.left,
  }
}

interface UsePreviewPanelOptions {
  patchRef?: React.MutableRefObject<((editorId: string, property: string, value: string) => void) | null>
}

export const usePreviewPanel = ({ code, selectMode, selectedNodeId, onNodeSelect }: UsePreviewPanelProps, { patchRef }: UsePreviewPanelOptions = {}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<ReactDOM.Root | null>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const hasRenderedRef = useRef(false)
  const userComponentRef = useRef<React.ComponentType<any> | null>(null)
  const skipRenderRef = useRef(false)

  const [error, setError] = useState<string | null>(null)
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const [selectBadge, setSelectBadge] = useState<BadgeInfo | null>(null)

  // Stable wrapper — same function identity across renders so React keeps the
  // tree mounted and only diffs children when the user's component swaps.
  const StableWrapper = useRef(function StableWrapper() {
    const C = userComponentRef.current
    return C ? React.createElement(C) : null
  }).current

  const patchStyle = useCallback((editorId: string, property: string, value: string) => {
    if (!mountRef.current) return
    const el = mountRef.current.querySelector(`[${EDITOR_ID_ATTR}="${editorId}"]`) as HTMLElement | null
    if (!el) return
    skipRenderRef.current = true
    if (property === 'text') {
      const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE)
      if (textNode) textNode.textContent = value
    } else {
      el.style[property as any] = value
    }
  }, [])

  useEffect(() => {
    if (patchRef) patchRef.current = patchStyle
    return () => { if (patchRef) patchRef.current = null }
  }, [patchRef, patchStyle])

  const renderUserComponent = () => {
    const timer = setTimeout(() => {
      if (skipRenderRef.current) { skipRenderRef.current = false; return }
      if (!mountRef.current) return

      // Only surface a parse error if we've never rendered anything yet —
      // otherwise keep the last good preview visible while the user types.
      const fail = (msg: string) => { if (!hasRenderedRef.current) setError(msg) }

      try {
        const transpiled = transpileCode(code)
        if (!transpiled) return fail(ERROR_PARSE_FAILED)

        const stripped = stripExports(transpiled)
        if (!stripped) return fail(ERROR_TRANSPILE_FAILED)

        const UserComponent = findUserComponent(stripped)
        if (!UserComponent) return fail(ERROR_NO_COMPONENT)

        setError(null)
        userComponentRef.current = UserComponent
        if (!rootRef.current) rootRef.current = ReactDOM.createRoot(mountRef.current)
        rootRef.current.render(React.createElement(StableWrapper))
        hasRenderedRef.current = true
      } catch (e: any) {
        fail(e?.message ?? ERROR_UNKNOWN)
      }
    }, RENDER_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }

  const highlightSelectedElement = () => {
    if (!selectedNodeId || !mountRef.current || !highlightRef.current) {
      if (highlightRef.current) highlightRef.current.style.display = 'none'
      setSelectBadge(null)
      return
    }
    const el = mountRef.current.querySelector(`[${EDITOR_ID_ATTR}="${selectedNodeId}"]`) as HTMLElement | null
    if (!el || !highlightRef.current) { setSelectBadge(null); return }

    const containerRect = mountRef.current.parentElement!.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()

    highlightRef.current.style.display = 'block'
    highlightRef.current.style.top = `${elRect.top - containerRect.top}px`
    highlightRef.current.style.left = `${elRect.left - containerRect.left}px`
    highlightRef.current.style.width = `${elRect.width}px`
    highlightRef.current.style.height = `${elRect.height}px`

    setSelectBadge(getBadgeInfo(el, containerRect))
  }

  const setupInspectListeners = () => {
    const mount = mountRef.current
    if (!mount || !selectMode) { setHoverInfo(null); return }

    const onClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const el = resolveElementAtClick(e.target as HTMLElement, selectedNodeId)
      const editorId = el?.getAttribute(EDITOR_ID_ATTR)
      if (!editorId) { onNodeSelect(null); return }
      const info = extractNodeInfo(code, editorId)
      if (!info) return
      onNodeSelect({ id: editorId, tag: info.tag, text: info.text, props: {}, style: info.style })
    }

    const onMouseOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(EDITOR_ID_SELECTOR) as HTMLElement | null
      if (!el || !mount.parentElement) { setHoverInfo(null); return }
      const rect = el.getBoundingClientRect()
      const containerRect = mount.parentElement.getBoundingClientRect()
      setHoverInfo({ rect, badge: getBadgeInfo(el, containerRect) })
    }

    const onMouseLeave = () => setHoverInfo(null)

    mount.addEventListener('click', onClick, true)
    mount.addEventListener('mouseover', onMouseOver)
    mount.addEventListener('mouseleave', onMouseLeave)
    return () => {
      mount.removeEventListener('click', onClick, true)
      mount.removeEventListener('mouseover', onMouseOver)
      mount.removeEventListener('mouseleave', onMouseLeave)
    }
  }

  useEffect(renderUserComponent, [code])
  useEffect(highlightSelectedElement, [selectedNodeId, code])
  useEffect(setupInspectListeners, [code, onNodeSelect, selectMode, selectedNodeId])

  const { badge: hoverBadge, rect: hoverRect } = hoverInfo ?? {}
  const isHoverDistinct = hoverBadge && (!selectBadge ||
    hoverBadge.tag !== selectBadge.tag ||
    hoverBadge.top !== selectBadge.top ||
    hoverBadge.left !== selectBadge.left
  )

  return { mountRef, highlightRef, error, hoverBadge, hoverRect, selectBadge, isHoverDistinct }
}
