const FUNCTION_DECLARATION_PATTERN = /function\s+([A-Z][A-Za-z0-9_$]*)/
const CONST_DECLARATION_PATTERN = /const\s+([A-Z][A-Za-z0-9_$]*)/
const UNTITLED_LABEL = 'Untitled'

export const extractLabel = (code: string): string => {
  const match = code.match(FUNCTION_DECLARATION_PATTERN) ?? code.match(CONST_DECLARATION_PATTERN)
  return match?.[1] ?? UNTITLED_LABEL
}
