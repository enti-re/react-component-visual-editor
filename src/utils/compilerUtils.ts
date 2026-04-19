// @ts-ignore
import * as Babel from '@babel/standalone'
import * as React from 'react'
import { instrumentCode } from './astUtils'
import {
  STRIP_EXPORT_DEFAULT,
  STRIP_EXPORT,
  CAPITALIZED_DECLARATION_PATTERN,
  FALLBACK_COMPONENT_NAMES,
} from './previewConstants'

export const transpileCode = (code: string): string | null => {
  const instrumented = instrumentCode(code)
  if (!instrumented) return null
  return Babel.transform(instrumented, { presets: ['react'], sourceType: 'module' })?.code ?? null
}

export const stripExports = (code: string): string =>
  code.replace(STRIP_EXPORT_DEFAULT, '').replace(STRIP_EXPORT, '')

export const findUserComponent = (stripped: string): React.ComponentType<any> | null => {
  const declared: string[] = []
  const declRe = new RegExp(CAPITALIZED_DECLARATION_PATTERN.source, 'g')
  let m: RegExpExecArray | null
  while ((m = declRe.exec(stripped)) !== null) declared.push(m[1])

  const candidates = [...new Set([...declared, ...FALLBACK_COMPONENT_NAMES])]
  const lookup = candidates.map(n => `typeof ${n} !== 'undefined' ? ${n} : `).join('')

  // eslint-disable-next-line no-new-func
  return new Function('React', `${stripped}; return ${lookup}null`)(React)
}
