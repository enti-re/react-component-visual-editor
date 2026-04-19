import { InspectIllustration, ClickIllustration } from './icons'
import { PropSection } from './PropSection'
import { PropField } from './PropField'
import { toHex } from '../helpers/colorUtils'
import type { SelectedNode } from '../types'

interface PropertiesPanelProps {
  selectedNode: SelectedNode | null
  selectMode: boolean
  onPropertyChange: (property: string, value: string) => void
}

const TEXT_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'label', 'li', 'td', 'th', 'caption', 'dt', 'dd'])

export const PropertiesPanel = ({ selectedNode, selectMode, onPropertyChange }: PropertiesPanelProps) => {
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
          <PropField label="Text" type="text" value={selectedNode.text ?? ''} onChange={(v) => onPropertyChange('text', v)} />
        </PropSection>
      )}

      <PropSection title="Typography">
        <PropField label="Color" type="color" value={toHex(s.color) ?? '#000000'} onChange={(v) => onPropertyChange('color', v)} />
        <PropField label="Font Size" type="text" placeholder="e.g. 16px" value={s.fontSize ?? ''} onChange={(v) => onPropertyChange('fontSize', v)} />
        <PropField label="Font Weight" type="select" value={s.fontWeight ?? 'normal'} options={['normal', '300', '400', '500', '600', '700', '800', 'bold']} onChange={(v) => onPropertyChange('fontWeight', v)} />
      </PropSection>

      <PropSection title="Background">
        <PropField label="Background" type="color" value={toHex(s.backgroundColor) ?? '#ffffff'} onChange={(v) => onPropertyChange('backgroundColor', v)} />
      </PropSection>

      <PropSection title="Spacing">
        <PropField label="Padding" type="text" placeholder="e.g. 16px" value={s.padding ?? ''} onChange={(v) => onPropertyChange('padding', v)} />
        <PropField label="Border Radius" type="text" placeholder="e.g. 8px" value={s.borderRadius ?? ''} onChange={(v) => onPropertyChange('borderRadius', v)} />
      </PropSection>
    </div>
  )
}
