// @ts-ignore - babel standalone types
import * as Babel from '@babel/standalone'

let nodeCounter = 0

// ─── Instrument ──────────────────────────────────────────────────────────────
// Walk the JSX AST and inject data-editor-id onto every JSX element.
// Returns the instrumented code string.
export function instrumentCode(code: string): string {
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

function instrumentPlugin() {
  return {
    visitor: {
      JSXOpeningElement(path: any) {
        const id = `eid-${++nodeCounter}`
        const attr = Babel.packages.types.jsxAttribute(
          Babel.packages.types.jsxIdentifier('data-editor-id'),
          Babel.packages.types.stringLiteral(id)
        )
        path.node.attributes.push(attr)
      },
    },
  }
}

// ─── Parse helpers ───────────────────────────────────────────────────────────
function parseCode(code: string) {
  return Babel.packages.parser.parse(code, {
    plugins: ['jsx'],
    sourceType: 'module',
  })
}

function generateCode(ast: any): string {
  return Babel.packages.generator.default(ast, { retainLines: false, concise: false }, '').code
}

// ─── Extract node info ───────────────────────────────────────────────────────
// Editor IDs follow the format 'eid-N' where N is the 1-indexed traversal order
// that matches instrumentCode's counter. We walk the raw AST in the same order.
function idToIndex(editorId: string): number {
  const m = editorId.match(/^eid-(\d+)$/)
  return m ? parseInt(m[1], 10) : -1
}

function findNodeByIndex(ast: any, targetIdx: number): any {
  let counter = 0
  let found: any = null
  traverseJSX(ast, (node: any) => {
    counter += 1
    if (counter === targetIdx && !found) found = node
  })
  return found
}

export function extractNodeInfo(
  code: string,
  editorId: string
): { tag: string; text: string; style: Record<string, string> } | null {
  try {
    const idx = idToIndex(editorId)
    if (idx < 1) return null
    const ast = parseCode(code)
    const found = findNodeByIndex(ast, idx)
    if (!found) return null

    const tag = found.openingElement.name.name as string
    const text = extractTextContent(found)
    const style = extractInlineStyle(found)

    return { tag, text, style }
  } catch {
    return null
  }
}

function extractTextContent(jsxElement: any): string {
  const children = jsxElement.children ?? []
  return children
    .filter((c: any) => c.type === 'JSXText')
    .map((c: any) => c.value.trim())
    .filter(Boolean)
    .join(' ')
}

function extractInlineStyle(jsxElement: any): Record<string, string> {
  const attrs = jsxElement.openingElement?.attributes ?? []
  const styleAttr = attrs.find(
    (a: any) => a.type === 'JSXAttribute' && a.name?.name === 'style'
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

// ─── Update node ─────────────────────────────────────────────────────────────
// property can be: 'text', or any camelCase CSS property like 'color', 'fontSize', 'fontWeight'
export function updateNodeInCode(
  code: string,
  editorId: string,
  property: string,
  value: string
): string | null {
  try {
    const idx = idToIndex(editorId)
    if (idx < 1) return null
    const ast = parseCode(code)
    const node = findNodeByIndex(ast, idx)
    if (!node) return null

    if (property === 'text') {
      // Replace first JSXText child
      const children: any[] = node.children ?? []
      const textIdx = children.findIndex((c: any) => c.type === 'JSXText' && c.value.trim())
      if (textIdx !== -1) {
        children[textIdx].value = value
      } else {
        node.children = [Babel.packages.types.jsxText(value)]
      }
    } else {
      // CSS property — update or create style={{ }} attribute
      setInlineStyleProperty(node, property, value)
    }

    return generateCode(ast)
  } catch {
    return null
  }
}

function setInlineStyleProperty(jsxElement: any, property: string, value: string) {
  const t = Babel.packages.types
  const attrs: any[] = jsxElement.openingElement.attributes

  let styleAttr = attrs.find(
    (a: any) => a.type === 'JSXAttribute' && a.name?.name === 'style'
  )

  if (!styleAttr) {
    // Create style={{}} attribute
    const objExpr = t.objectExpression([])
    styleAttr = t.jsxAttribute(
      t.jsxIdentifier('style'),
      t.jsxExpressionContainer(objExpr)
    )
    attrs.push(styleAttr)
  }

  const objExpr = styleAttr.value?.expression
  if (!objExpr || objExpr.type !== 'ObjectExpression') return

  const existingProp = objExpr.properties.find(
    (p: any) => (p.key?.name ?? p.key?.value) === property
  )

  if (existingProp) {
    existingProp.value = t.stringLiteral(value)
  } else {
    objExpr.properties.push(
      t.objectProperty(t.identifier(property), t.stringLiteral(value))
    )
  }
}

// ─── Strip editor IDs ────────────────────────────────────────────────────────
export function stripEditorIds(code: string): string {
  try {
    const ast = parseCode(code)
    traverseJSX(ast, (node: any) => {
      const attrs: any[] = node.openingElement?.attributes ?? []
      const idx = attrs.findIndex(
        (a: any) => a.type === 'JSXAttribute' && a.name?.name === 'data-editor-id'
      )
      if (idx !== -1) attrs.splice(idx, 1)
    })
    return generateCode(ast)
  } catch {
    return code
  }
}

// ─── Traverse ────────────────────────────────────────────────────────────────
function traverseJSX(ast: any, visitor: (node: any) => void) {
  function walk(node: any) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'JSXElement') visitor(node)
    for (const key of Object.keys(node)) {
      const child = node[key]
      if (Array.isArray(child)) child.forEach(walk)
      else if (child && typeof child === 'object' && child.type) walk(child)
    }
  }
  walk(ast)
}
