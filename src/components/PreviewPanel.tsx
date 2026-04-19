import { useEffect, useRef, useState } from 'react'
// @ts-ignore
import * as Babel from '@babel/standalone'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { instrumentCode, extractNodeInfo } from '../utils/astUtils'
import type { SelectedNode } from '../types'

interface PreviewPanelProps {
  code: string
  selectMode: boolean
  selectedNodeId: string | null
  onNodeSelect: (node: SelectedNode | null) => void
}

interface BadgeInfo {
  tag: string
  top: number
  left: number
}

export function PreviewPanel({ code, selectMode, selectedNodeId, onNodeSelect }: PreviewPanelProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<ReactDOM.Root | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null)
  const [hoverBadge, setHoverBadge] = useState<BadgeInfo | null>(null)
  const [selectBadge, setSelectBadge] = useState<BadgeInfo | null>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  const hasRenderedRef = useRef(false)
  const userComponentRef = useRef<React.ComponentType<any> | null>(null)
  // Stable wrapper — same function identity across renders so React keeps the
  // tree mounted and only diffs children when the user's component swaps.
  const StableWrapper = useRef(function StableWrapper() {
    const C = userComponentRef.current
    return C ? React.createElement(C) : null
  }).current

  // Render the user's component into the mount div (debounced so mid-typing
  // parse failures don't flash errors on every keystroke).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mountRef.current) return

      const fail = (msg: string) => {
        // Only surface a parse error if we've never rendered anything yet —
        // otherwise keep the last good preview visible while the user types.
        if (!hasRenderedRef.current) setError(msg)
      }

      try {
        const instrumented = instrumentCode(code)
        if (!instrumented) return fail('Could not parse JSX')

        const transpiled = Babel.transform(instrumented, {
          presets: ['react'],
          sourceType: 'module',
        })?.code
        if (!transpiled) return fail('Transpilation failed')

        const stripped = transpiled
          .replace(/export\s+default\s+/g, '')
          .replace(/^\s*export\s+/gm, '')

        const declared: string[] = []
        const declRe = /(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9_$]*)/g
        let m: RegExpExecArray | null
        while ((m = declRe.exec(stripped)) !== null) declared.push(m[1])
        const candidates = [...new Set([...declared, 'MyComponent', 'App'])]
        const lookup = candidates
          .map((n) => `typeof ${n} !== 'undefined' ? ${n} : `)
          .join('')

        // eslint-disable-next-line no-new-func
        const fn = new Function('React', `${stripped}; return ${lookup}null`)
        const UserComponent = fn(React)

        if (!UserComponent) {
          return fail('No component found. Declare a capitalized function/const (e.g. "MyComponent") or use `export default`.')
        }

        setError(null)
        userComponentRef.current = UserComponent
        if (!rootRef.current) {
          rootRef.current = ReactDOM.createRoot(mountRef.current)
        }
        rootRef.current.render(React.createElement(StableWrapper))
        hasRenderedRef.current = true
      } catch (e: any) {
        fail(e?.message ?? 'Unknown error')
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [code])

  // Highlight the selected element
  useEffect(() => {
    if (!selectedNodeId || !mountRef.current || !highlightRef.current) {
      if (highlightRef.current) highlightRef.current.style.display = 'none'
      setSelectBadge(null)
      return
    }
    const el = mountRef.current.querySelector(`[data-editor-id="${selectedNodeId}"]`) as HTMLElement | null
    if (!el || !highlightRef.current) {
      setSelectBadge(null)
      return
    }

    const containerRect = mountRef.current.parentElement!.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()

    highlightRef.current.style.display = 'block'
    highlightRef.current.style.top = `${elRect.top - containerRect.top}px`
    highlightRef.current.style.left = `${elRect.left - containerRect.left}px`
    highlightRef.current.style.width = `${elRect.width}px`
    highlightRef.current.style.height = `${elRect.height}px`

    setSelectBadge({
      tag: el.tagName.toLowerCase(),
      top: elRect.top - containerRect.top,
      left: elRect.left - containerRect.left,
    })
  }, [selectedNodeId, code])

  // Native click + hover listeners — only active when in select mode.
  // React's synthetic onClick doesn't fire across nested React roots, so we use native events.
  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !selectMode) {
      setHoverRect(null)
      setHoverBadge(null)
      return
    }

    const onClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const target = e.target as HTMLElement
      let el = target.closest('[data-editor-id]') as HTMLElement | null

      // If the clicked element is already selected, walk up to its parent
      if (el && el.getAttribute('data-editor-id') === selectedNodeId) {
        el = el.parentElement?.closest('[data-editor-id]') as HTMLElement | null ?? el
      }

      const editorId = el?.getAttribute('data-editor-id')

      if (!editorId) {
        onNodeSelect(null)
        return
      }

      const info = extractNodeInfo(code, editorId)
      if (!info) return

      onNodeSelect({
        id: editorId,
        tag: info.tag,
        text: info.text,
        props: {},
        style: info.style,
      })
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const el = target.closest('[data-editor-id]') as HTMLElement | null
      if (!el || !mount.parentElement) {
        setHoverRect(null)
        setHoverBadge(null)
        return
      }
      const rect = el.getBoundingClientRect()
      const containerRect = mount.parentElement.getBoundingClientRect()
      setHoverRect(rect)
      setHoverBadge({
        tag: el.tagName.toLowerCase(),
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
      })
    }

    const onMouseLeave = () => {
      setHoverRect(null)
      setHoverBadge(null)
    }

    mount.addEventListener('click', onClick, true)
    mount.addEventListener('mouseover', onMouseOver)
    mount.addEventListener('mouseleave', onMouseLeave)
    return () => {
      mount.removeEventListener('click', onClick, true)
      mount.removeEventListener('mouseover', onMouseOver)
      mount.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [code, onNodeSelect, selectMode, selectedNodeId])

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
              <div
                className="preview-badge preview-badge--select"
                style={{ top: selectBadge.top, left: selectBadge.left }}
              >
                {selectBadge.tag}
              </div>
            )}
            {selectMode && hoverRect && (
              <HoverHighlight rect={hoverRect} mountEl={mountRef.current} />
            )}
            {selectMode && hoverBadge && (!selectBadge || hoverBadge.tag !== selectBadge.tag || hoverBadge.top !== selectBadge.top || hoverBadge.left !== selectBadge.left) && (
              <div
                className="preview-badge preview-badge--hover"
                style={{ top: hoverBadge.top, left: hoverBadge.left }}
              >
                {hoverBadge.tag}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function HoverHighlight({ rect, mountEl }: { rect: DOMRect; mountEl: HTMLDivElement | null }) {
  if (!mountEl?.parentElement) return null
  const containerRect = mountEl.parentElement.getBoundingClientRect()
  return (
    <div
      className="preview-hover"
      style={{
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
      }}
    />
  )
}
