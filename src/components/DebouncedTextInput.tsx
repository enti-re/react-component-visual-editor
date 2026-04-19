import { useEffect, useRef, useState } from 'react'

interface DebouncedTextInputProps {
  value: string
  onCommit: (v: string) => void
  className?: string
  placeholder?: string
}

// Mirrors the parent's value but keeps a local state copy so the input stays
// responsive during controlled-input round-trips. Commits on every change.
export const DebouncedTextInput = ({ value, onCommit, className, placeholder }: DebouncedTextInputProps) => {
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
