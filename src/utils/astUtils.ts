// @ts-ignore - babel standalone types
import * as Babel from '@babel/standalone'

const NODE_ID_PREFIX = 'eid-'
const NODE_ID_PATTERN = /^eid-(\d+)$/
const TEXT_NODE_TYPE = 'JSXText'
const JSX_ELEMENT_TYPE = 'JSXElement'
const JSX_ATTRIBUTE_TYPE = 'JSXAttribute'
const OBJECT_EXPRESSION_TYPE = 'ObjectExpression'
const PARSE_RADIX = 10

let nodeCounter = 0

// ─── AST primitives ──────────────────────────────────────────────────────────

const parseCode = (code: string) =>
  Babel.packages.parser.parse(code, { plugins: ['jsx'], sourceType: 'module' })

const generateCode = (ast: any): string =>
  Babel.packages.generator.default(ast, { retainLines: false, concise: false }, '').code

const traverseJSX = (ast: any, visitor: (node: any) => void) => {
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return
    if (node.type === JSX_ELEMENT_TYPE) visitor(node)
    for (const key of Object.keys(node)) {
      const child = node[key]
      if (Array.isArray(child)) child.forEach(walk)
      else if (child && typeof child === 'object' && child.type) walk(child)
    }
  }
  walk(ast)
}

// ─── Node lookup ─────────────────────────────────────────────────────────────

const parseNodeIndex = (editorId: string): number => {
  const match = editorId.match(NODE_ID_PATTERN)
  return match ? parseInt(match[1], PARSE_RADIX) : -1
}

const findNodeByIndex = (ast: any, targetIdx: number): any => {
  let counter = 0
  let found: any = null
  traverseJSX(ast, (node: any) => {
    counter += 1
    if (counter === targetIdx && !found) found = node
  })
  return found
}

// ─── Node readers ─────────────────────────────────────────────────────────────

const extractTextContent = (jsxElement: any): string => {
  const children = jsxElement.children ?? []
  return children
    .filter((child: any) => child.type === TEXT_NODE_TYPE)
    .map((child: any) => child.value.trim())
    .filter(Boolean)
    .join(' ')
}

const extractInlineStyle = (jsxElement: any): Record<string, string> => {
  const attrs = jsxElement.openingElement?.attributes ?? []
  const styleAttr = attrs.find(
    (attr: any) => attr.type === JSX_ATTRIBUTE_TYPE && attr.name?.name === 'style'
  )
  if (!styleAttr?.value?.expression?.properties) return {}

  const result: Record<string, string> = {}
  for (const prop of styleAttr.value.expression.properties) {
    const key = prop.key?.name ?? prop.key?.value
    const val = prop.value?.value ?? prop.value?.extra?.rawValue ?? String(prop.value?.value ?? '')
    if (key) result[key] = String(val)
  }
  return result
}

// ─── Node writers ─────────────────────────────────────────────────────────────

const setInlineStyleProperty = (jsxElement: any, property: string, value: string) => {
  const t = Babel.packages.types
  const attrs: any[] = jsxElement.openingElement.attributes

  let styleAttr = attrs.find(
    (attr: any) => attr.type === JSX_ATTRIBUTE_TYPE && attr.name?.name === 'style'
  )

  if (!styleAttr) {
    const objExpr = t.objectExpression([])
    styleAttr = t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(objExpr))
    attrs.push(styleAttr)
  }

  const objExpr = styleAttr.value?.expression
  if (!objExpr || objExpr.type !== OBJECT_EXPRESSION_TYPE) return

  const existingProp = objExpr.properties.find(
    (prop: any) => (prop.key?.name ?? prop.key?.value) === property
  )

  if (existingProp) {
    existingProp.value = t.stringLiteral(value)
  } else {
    objExpr.properties.push(t.objectProperty(t.identifier(property), t.stringLiteral(value)))
  }
}

// ─── Instrumentation ─────────────────────────────────────────────────────────

const instrumentPlugin = () => ({
  visitor: {
    JSXOpeningElement(path: any) {
      const id = `${NODE_ID_PREFIX}${++nodeCounter}`
      const attr = Babel.packages.types.jsxAttribute(
        Babel.packages.types.jsxIdentifier('data-editor-id'),
        Babel.packages.types.stringLiteral(id)
      )
      path.node.attributes.push(attr)
    },
  },
})

export const instrumentCode = (code: string): string => {
  nodeCounter = 0
  try {
    const result = Babel.transform(code, {
      plugins: [instrumentPlugin],
      presets: ['react'],
      retainLines: true,
      sourceType: 'module',
    })
    return result?.code ?? code
  } catch {
    return ''
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const extractNodeInfo = (
  code: string,
  editorId: string
): { tag: string; text: string; style: Record<string, string> } | null => {
  try {
    const idx = parseNodeIndex(editorId)
    if (idx < 1) return null
    const ast = parseCode(code)
    const found = findNodeByIndex(ast, idx)
    if (!found) return null

    return {
      tag: found.openingElement.name.name as string,
      text: extractTextContent(found),
      style: extractInlineStyle(found),
    }
  } catch {
    return null
  }
}

export const updateNodeInCode = (
  code: string,
  editorId: string,
  property: string,
  value: string
): string | null => {
  try {
    const idx = parseNodeIndex(editorId)
    if (idx < 1) return null
    const ast = parseCode(code)
    const node = findNodeByIndex(ast, idx)
    if (!node) return null

    if (property === 'text') {
      const children: any[] = node.children ?? []
      const textIdx = children.findIndex((child: any) => child.type === TEXT_NODE_TYPE && child.value.trim())
      if (textIdx !== -1) {
        children[textIdx].value = value
      } else {
        node.children = [Babel.packages.types.jsxText(value)]
      }
    } else {
      setInlineStyleProperty(node, property, value)
    }

    return generateCode(ast)
  } catch {
    return null
  }
}
