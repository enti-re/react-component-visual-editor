import { DebouncedTextInput } from './DebouncedTextInput'

interface PropFieldProps {
  label: string
  type: 'text' | 'color' | 'select'
  value: string
  placeholder?: string
  options?: string[]
  onChange: (value: string) => void
}

export const PropField = ({ label, type, value, placeholder, options, onChange }: PropFieldProps) => (
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
