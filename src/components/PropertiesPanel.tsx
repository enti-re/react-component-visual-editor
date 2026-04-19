import { useEffect, useRef, useState } from 'react'
import type { SelectedNode } from '../types'

interface PropertiesPanelProps {
  selectedNode: SelectedNode | null
  selectMode: boolean
  onPropertyChange: (property: string, value: string) => void
}

const TEXT_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'label', 'li', 'td', 'th', 'caption', 'dt', 'dd'])

export function PropertiesPanel({ selectedNode, selectMode, onPropertyChange }: PropertiesPanelProps) {
  if (!selectMode) {
    return (
      <div className="props-empty">
        <InspectIllustration />
        <p className="props-empty-sub">Enable Inspect to select elements</p>
      </div>
    )
  }

  if (!selectedNode) {
    return (
      <div className="props-empty">
        <ClickIllustration />
        <p className="props-empty-sub">Click an element to edit</p>
      </div>
    )
  }

  const isTextElement = TEXT_TAGS.has(selectedNode.tag.toLowerCase())
  const s = selectedNode.style

  return (
    <div className="props-panel">
      <div className="props-tag-badge">&lt;{selectedNode.tag}&gt;</div>

      {isTextElement && (
        <PropSection title="Content">
          <PropField
            label="Text"
            type="text"
            value={selectedNode.text ?? ''}
            onChange={(v) => onPropertyChange('text', v)}
          />
        </PropSection>
      )}

      <PropSection title="Typography">
        <PropField
          label="Color"
          type="color"
          value={toHex(s.color) ?? '#000000'}
          onChange={(v) => onPropertyChange('color', v)}
        />
        <PropField
          label="Font Size"
          type="text"
          placeholder="e.g. 16px"
          value={s.fontSize ?? ''}
          onChange={(v) => onPropertyChange('fontSize', v)}
        />
        <PropField
          label="Font Weight"
          type="select"
          value={s.fontWeight ?? 'normal'}
          options={['normal', '300', '400', '500', '600', '700', '800', 'bold']}
          onChange={(v) => onPropertyChange('fontWeight', v)}
        />
      </PropSection>

      <PropSection title="Background">
        <PropField
          label="Background"
          type="color"
          value={toHex(s.backgroundColor) ?? '#ffffff'}
          onChange={(v) => onPropertyChange('backgroundColor', v)}
        />
      </PropSection>

      <PropSection title="Spacing">
        <PropField
          label="Padding"
          type="text"
          placeholder="e.g. 16px"
          value={s.padding ?? ''}
          onChange={(v) => onPropertyChange('padding', v)}
        />
        <PropField
          label="Border Radius"
          type="text"
          placeholder="e.g. 8px"
          value={s.borderRadius ?? ''}
          onChange={(v) => onPropertyChange('borderRadius', v)}
        />
      </PropSection>
    </div>
  )
}

// ─── Illustrations ────────────────────────────────────────────────────────────

function InspectIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="18" width="44" height="32" rx="3" stroke="#2e2e2e" strokeWidth="1.2"/>
      <line x1="22" y1="28" x2="38" y2="28" stroke="#2e2e2e" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="22" y1="34" x2="50" y2="34" stroke="#272727" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="22" y1="40" x2="44" y2="40" stroke="#272727" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="6" y1="34" x2="14" y2="34" stroke="#2e2e2e" strokeWidth="1" strokeLinecap="round"/>
      <line x1="58" y1="34" x2="66" y2="34" stroke="#2e2e2e" strokeWidth="1" strokeLinecap="round"/>
      <line x1="36" y1="8" x2="36" y2="18" stroke="#2e2e2e" strokeWidth="1" strokeLinecap="round"/>
      <line x1="36" y1="50" x2="36" y2="64" stroke="#2e2e2e" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="36" cy="34" r="4" stroke="#383838" strokeWidth="1"/>
      <circle cx="36" cy="34" r="1.2" fill="#383838"/>
    </svg>
  )
}

function ClickIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="16" width="42" height="32" rx="3" stroke="#2e2e2e" strokeWidth="1.2" strokeDasharray="3 2"/>
      <path d="M12 22 L12 16 L18 16" stroke="#383838" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48 16 L54 16 L54 22" stroke="#383838" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 42 L12 48 L18 48" stroke="#383838" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48 48 L54 48 L54 42" stroke="#383838" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="22" y1="27" x2="38" y2="27" stroke="#2a2a2a" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="22" y1="33" x2="46" y2="33" stroke="#252525" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="22" y1="39" x2="40" y2="39" stroke="#252525" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M50 50 L50 62 L53 59 L55.5 64 L57.5 63 L55 58 L59 58 Z" stroke="#383838" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PropSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="props-section">
      <div className="props-section-title">{title}</div>
      {children}
    </div>
  )
}

interface PropFieldProps {
  label: string
  type: 'text' | 'color' | 'select'
  value: string
  placeholder?: string
  options?: string[]
  onChange: (value: string) => void
}

function PropField({ label, type, value, placeholder, options, onChange }: PropFieldProps) {
  return (
    <div className="prop-field">
      <label className="prop-label">{label}</label>
      {type === 'color' ? (
        <div className="prop-color-wrapper">
          <input
            type="color"
            className="prop-color-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <DebouncedTextInput
            className="prop-text-input prop-text-input--hex"
            value={value}
            onCommit={onChange}
          />
        </div>
      ) : type === 'select' ? (
        <select
          className="prop-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options?.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <DebouncedTextInput
          className="prop-text-input"
          value={value}
          placeholder={placeholder}
          onCommit={onChange}
        />
      )}
    </div>
  )
}

// Mirrors the parent's value but keeps a local state copy so the input stays
// responsive during controlled-input round-trips. Commits on every change.
function DebouncedTextInput({
  value,
  onCommit,
  className,
  placeholder,
}: {
  value: string
  onCommit: (v: string) => void
  className?: string
  placeholder?: string
}) {
  const [local, setLocal] = useState(value)
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) setLocal(value)
  }, [value])

  return (
    <input
      type="text"
      className={className}
      value={local}
      placeholder={placeholder}
      onFocus={() => { focusedRef.current = true }}
      onBlur={() => { focusedRef.current = false }}
      onChange={(e) => {
        const v = e.target.value
        setLocal(v)
        onCommit(v)
      }}
    />
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toHex(color: string | undefined): string | undefined {
  if (!color) return undefined
  if (color.startsWith('#')) return color
  // Handle rgb(r, g, b)
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) {
    return (
      '#' +
      [match[1], match[2], match[3]]
        .map((n) => parseInt(n).toString(16).padStart(2, '0'))
        .join('')
    )
  }
  return color
}
