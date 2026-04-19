import { useState, useCallback, useEffect, useRef } from 'react'
import { getRecents, formatRelativeTime } from '../recents'
import { CodePanel } from './CodePanel'
import { PreviewPanel } from './PreviewPanel'
import { PropertiesPanel } from './PropertiesPanel'
import type { SelectedNode } from '../types'
import { updateNodeInCode } from '../utils/astUtils'
import '../styles/editor.css'

interface WebsiteEditorProps {
  initialCode: string
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  isDirty?: boolean
  componentId?: string | null
  componentName?: string
  onSave?: (code: string) => void
  onCodeChange?: () => void
  onRevert?: () => void
  onNew?: () => void
  onLoadRecent?: (id: string) => void
  onCopyLink?: () => void
  onNameChange?: (name: string) => void
}

const MIN_CODE = 240
const MIN_PROPS = 220
const MIN_PREVIEW = 320

export function WebsiteEditor({ initialCode, saveStatus = 'idle', isDirty = false, componentId, componentName = 'Untitled', onSave, onCodeChange, onRevert, onNew, onLoadRecent, onCopyLink, onNameChange }: WebsiteEditorProps) {

  const [code, setCode] = useState(initialCode)
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [selectMode, setSelectMode] = useState(false)

  const bodyRef = useRef<HTMLDivElement>(null)
  const [codeWidth, setCodeWidth] = useState(480)
  const [propsWidth, setPropsWidth] = useState(300)
  const [codeCollapsed, setCodeCollapsed] = useState(false)
  const [propsCollapsed, setPropsCollapsed] = useState(false)
  const dragRef = useRef<{ side: 'left' | 'right'; startX: number; startW: number } | null>(null)

  const onDragStart = (side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = {
      side,
      startX: e.clientX,
      startW: side === 'left' ? codeWidth : propsWidth,
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d || !bodyRef.current) return
      const total = bodyRef.current.clientWidth
      if (d.side === 'left') {
        const next = d.startW + (e.clientX - d.startX)
        const maxW = total - (propsCollapsed ? 0 : propsWidth) - MIN_PREVIEW
        setCodeWidth(Math.max(MIN_CODE, Math.min(next, maxW)))
      } else {
        const next = d.startW - (e.clientX - d.startX)
        const maxW = total - (codeCollapsed ? 0 : codeWidth) - MIN_PREVIEW
        setPropsWidth(Math.max(MIN_PROPS, Math.min(next, maxW)))
      }
    }
    const onUp = () => {
      if (!dragRef.current) return
      dragRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [codeWidth, propsWidth, codeCollapsed, propsCollapsed])

  // Keyboard shortcuts: ⌘/Ctrl+[ → toggle code panel, ⌘/Ctrl+] → toggle properties panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key === '[') {
        e.preventDefault()
        setCodeCollapsed((v) => !v)
      } else if (e.key === ']') {
        e.preventDefault()
        setPropsCollapsed((v) => !v)
      } else if (e.key === '\\') {
        e.preventDefault()
        const both = codeCollapsed && propsCollapsed
        setCodeCollapsed(!both)
        setPropsCollapsed(!both)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [codeCollapsed, propsCollapsed])

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
    setSelectedNode(null)
    onCodeChange?.()
  }, [onCodeChange])

  const toggleSelectMode = useCallback(() => {
    setSelectMode((v) => {
      if (v) setSelectedNode(null)
      return !v
    })
  }, [])

  const handleNodeSelect = useCallback((node: SelectedNode | null) => {
    setSelectedNode(node)
  }, [])

  const handlePropertyChange = useCallback(
    (property: string, value: string) => {
      if (!selectedNode) return
      const newCode = updateNodeInCode(code, selectedNode.id, property, value)
      if (newCode) {
        setCode(newCode)
        setSelectedNode((prev) => {
          if (!prev) return null
          if (property === 'text') return { ...prev, text: value }
          return { ...prev, style: { ...prev.style, [property]: value } }
        })
        onCodeChange?.()
      }
    },
    [code, selectedNode, onSave]
  )

  return (
    <div className="editor-root">
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
          <EditableName name={componentName} onChange={onNameChange} />
        </div>
        <div className="editor-header-actions">
          {/* Group 1 — Canvas tool */}
          <div className="editor-action-group">
            <button
              className={`editor-ghost-btn editor-inspect-btn ${selectMode ? 'editor-inspect-btn--active' : ''}`}
              onClick={toggleSelectMode}
              {...tooltipHandlers(selectMode ? 'Stop inspecting' : 'Inspect element', '', 'bottom')}
            >
              <InspectorIcon />
            </button>
          </div>

          <div className="editor-action-divider" />

          {/* Group 2 — Document actions */}
          <div className="editor-action-group">
            <button
              className="editor-ghost-btn"
              onClick={onRevert}
              disabled={!isDirty}
              {...tooltipHandlers('Revert changes', '', 'bottom')}
            >
              Revert
            </button>
            <SaveButton status={saveStatus} isDirty={isDirty} onClick={() => onSave?.(code)} />
          </div>

          <div className="editor-action-divider" />

          {/* Group 3 — Global actions */}
          <div className="editor-action-group">
            <RecentsMenu onLoad={onLoadRecent} currentId={componentId} />
            <button
              className="editor-ghost-btn"
              onClick={onNew}
              {...tooltipHandlers('New component', '', 'bottom')}
            >
              New
            </button>
            {componentId && onCopyLink && <ShareButton onClick={onCopyLink} />}
          </div>
        </div>
      </header>
      <div className="editor-body" ref={bodyRef}>
        {codeCollapsed ? (
          <button
            className="panel-rail panel-rail--left"
            onClick={() => setCodeCollapsed(false)}
            {...tooltipHandlers('Expand code', shortcutLabel('['), 'right')}
          >
            <ChevronIcon dir="right" />
            <span>Code</span>
          </button>
        ) : (
          <>
            <div
              className="editor-panel editor-panel--code"
              style={{ flex: `0 0 ${codeWidth}px` }}
            >
              <div className="panel-label">
                <span>Code</span>
                <button
                  className="panel-collapse-btn"
                  onClick={() => setCodeCollapsed(true)}
                  {...tooltipHandlers('Collapse', shortcutLabel('['), 'bottom')}
                >
                  <ChevronIcon dir="left" />
                </button>
              </div>
              <CodePanel code={code} onChange={handleCodeChange} />
            </div>
            <div
              className="panel-resizer"
              onMouseDown={onDragStart('left')}
              role="separator"
              aria-orientation="vertical"
            />
          </>
        )}
        <div className="editor-panel editor-panel--preview">
          <div className="panel-label">
            <span>Preview</span>
            <button
              className="panel-collapse-btn"
              onClick={() => {
                const next = !(codeCollapsed && propsCollapsed)
                setCodeCollapsed(next)
                setPropsCollapsed(next)
              }}
              {...tooltipHandlers(
                codeCollapsed && propsCollapsed ? 'Exit full preview' : 'Full preview',
                shortcutLabel('\\'),
                'bottom'
              )}
            >
              <FullPreviewIcon expanded={codeCollapsed && propsCollapsed} />
            </button>
          </div>
          <PreviewPanel
            code={code}
            selectMode={selectMode}
            selectedNodeId={selectedNode?.id ?? null}
            onNodeSelect={handleNodeSelect}
          />
        </div>
        {propsCollapsed ? (
          <button
            className="panel-rail panel-rail--right"
            onClick={() => setPropsCollapsed(false)}
            {...tooltipHandlers('Expand properties', shortcutLabel(']'), 'left')}
          >
            <ChevronIcon dir="left" />
            <span>Properties</span>
          </button>
        ) : (
          <>
            <div
              className="panel-resizer"
              onMouseDown={onDragStart('right')}
              role="separator"
              aria-orientation="vertical"
            />
            <div
              className="editor-panel editor-panel--properties"
              style={{ flex: `0 0 ${propsWidth}px` }}
            >
              <div className="panel-label">
                <div className="panel-label-group">
                  <button
                    className="panel-collapse-btn"
                    onClick={() => setPropsCollapsed(true)}
                    {...tooltipHandlers('Collapse', shortcutLabel(']'), 'bottom')}
                  >
                    <ChevronIcon dir="right" />
                  </button>
                  <span className="panel-label-title">
                    Properties
                  </span>
                </div>
              </div>
              <PropertiesPanel
                selectedNode={selectedNode}
                selectMode={selectMode}
                onPropertyChange={handlePropertyChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EditableName({ name, onChange }: { name: string; onChange?: (name: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(name) }, [name])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim() || name
    setDraft(trimmed)
    if (trimmed !== name) onChange?.(trimmed)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="editor-name-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); inputRef.current?.blur() }
          if (e.key === 'Escape') { setDraft(name); setEditing(false) }
        }}
        autoFocus
        spellCheck={false}
      />
    )
  }

  return (
    <button className="editor-name-btn" onClick={() => setEditing(true)} title="Rename component">
      <span>{name}</span>
      <PencilIcon />
    </button>
  )
}

function PencilIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="editor-name-pencil">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function RecentsMenu({ onLoad, currentId }: { onLoad?: (id: string) => void; currentId?: string | null }) {
  const [open, setOpen] = useState(false)
  const [recents, setRecents] = useState(getRecents)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setRecents(getRecents())
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (recents.length === 0) return null

  return (
    <div className="editor-more-wrap" ref={ref}>
      <button className="editor-ghost-btn" onClick={() => setOpen(v => !v)}>
        Recent
      </button>
      {open && (
        <div className="editor-more-menu">
          {recents.map(r => (
            <button
              key={r.id}
              className={`editor-more-item editor-recent-item${r.id === currentId ? ' editor-recent-item--active' : ''}`}
              onClick={() => { onLoad?.(r.id); setOpen(false) }}
            >
              <span className="editor-recent-label">{r.label}</span>
              <span className="editor-recent-time">{formatRelativeTime(r.savedAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MoreMenu({ isDirty, onRevert, onNew }: { isDirty: boolean; onRevert?: () => void; onNew?: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="editor-more-wrap" ref={ref}>
      <button className="editor-more-btn" onClick={() => setOpen(v => !v)}>
        <MoreIcon />
      </button>
      {open && (
        <div className="editor-more-menu">
          {isDirty && onRevert && (
            <button className="editor-more-item" onClick={() => { onRevert(); setOpen(false) }}>
              Revert changes
            </button>
          )}
          {onNew && (
            <button className="editor-more-item" onClick={() => { onNew(); setOpen(false) }}>
              New component
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
    </svg>
  )
}

function SaveButton({ status, isDirty, onClick }: { status: 'idle' | 'saving' | 'saved' | 'error'; isDirty: boolean; onClick: () => void }) {
  const isSaving = status === 'saving'
  const label = isSaving ? 'Saving…' : status === 'saved' ? 'Saved' : status === 'error' ? 'Error' : 'Save'
  const disabled = !isDirty || isSaving
  return (
    <div className="editor-save-wrap">
      <button
        className={`editor-save-btn${isDirty ? ' editor-save-btn--active' : ''}${isSaving ? ' editor-save-btn--saving' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        {isDirty && !isSaving && <span className="editor-save-dot" />}
        {label}
      </button>
    </div>
  )
}

function ShareButton({ onClick }: { onClick: () => void }) {
  const [copied, setCopied] = useState(false)
  const handleClick = () => {
    onClick()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className={`editor-share-btn${copied ? ' editor-share-btn--copied' : ''}`} onClick={handleClick}>
      {copied ? <CheckIcon /> : <LinkIcon />}
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}

function InspectorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l7.5 18 2.5-8 8-2.5L3 3z" />
    </svg>
  )
}

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
function shortcutLabel(key: string) {
  return IS_MAC ? `⌘${key}` : `Ctrl ${key}`
}

type TooltipState = { text: string; kbd: string; side: string; x: number; y: number } | null

let tooltipSetter: ((s: TooltipState) => void) | null = null

function showTooltip(el: HTMLElement, text: string, kbd: string, side: 'top' | 'bottom' | 'left' | 'right') {
  if (!tooltipSetter) return
  const r = el.getBoundingClientRect()
  // Anchor to the first child element's rect when available (so tall/full-height
  // buttons like panel rails anchor at the chevron, not the center of the rail).
  const anchor = (el.firstElementChild as HTMLElement | null)?.getBoundingClientRect() ?? r
  let x = r.left + r.width / 2, y = r.bottom + 8
  if (side === 'right') { x = r.right + 8; y = anchor.top + anchor.height / 2 }
  else if (side === 'left') { x = r.left - 8; y = anchor.top + anchor.height / 2 }
  else if (side === 'top') { y = r.top - 8 }
  tooltipSetter({ text, kbd, side, x, y })
}
function hideTooltip() { tooltipSetter?.(null) }

function tooltipHandlers(text: string, kbd: string, side: 'top' | 'bottom' | 'left' | 'right' = 'bottom') {
  return {
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => showTooltip(e.currentTarget, text, kbd, side),
    onPointerLeave: hideTooltip,
    onPointerDown: hideTooltip,
    onBlur: hideTooltip,
  }
}

function KbdTooltip() {
  const [state, setState] = useState<TooltipState>(null)
  useEffect(() => {
    tooltipSetter = setState
    return () => { tooltipSetter = null }
  }, [])

  if (!state) return null
  return (
    <div
      className={`kbd-tooltip kbd-tooltip--${state.side}`}
      style={{ top: state.y, left: state.x }}
    >
      <span>{state.text}</span>
      {state.kbd && <kbd>{state.kbd}</kbd>}
    </div>
  )
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  const d = dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

function FullPreviewIcon({ expanded }: { expanded: boolean }) {
  // "Maximize" glyph when panels are open; "exit fullscreen" when both collapsed.
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {expanded ? (
        <>
          <path d="M9 4v4a1 1 0 0 1-1 1H4" />
          <path d="M15 4v4a1 1 0 0 0 1 1h4" />
          <path d="M9 20v-4a1 1 0 0 0-1-1H4" />
          <path d="M15 20v-4a1 1 0 0 1 1-1h4" />
        </>
      ) : (
        <>
          <path d="M4 9V5a1 1 0 0 1 1-1h4" />
          <path d="M20 9V5a1 1 0 0 0-1-1h-4" />
          <path d="M4 15v4a1 1 0 0 0 1 1h4" />
          <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
        </>
      )}
    </svg>
  )
}
