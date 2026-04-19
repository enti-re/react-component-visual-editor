import Editor from '@monaco-editor/react'
import type { OnMount } from '@monaco-editor/react'

interface CodePanelProps {
  code: string
  onChange: (code: string) => void
}

const handleMount: OnMount = (_editor, monaco) => {
  monaco.editor.defineTheme('better', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'd4d4d4', background: '0f0f0f' },
      { token: 'comment', foreground: '525252', fontStyle: 'italic' },
      { token: 'string', foreground: 'a3a3a3' },
      { token: 'number', foreground: 'e5e5e5' },
      { token: 'keyword', foreground: 'fafafa', fontStyle: 'bold' },
      { token: 'tag', foreground: 'fafafa' },
      { token: 'attribute.name', foreground: 'a3a3a3' },
      { token: 'attribute.value', foreground: '8a8a8a' },
    ],
    colors: {
      'editor.background': '#0f0f0f',
      'editor.foreground': '#d4d4d4',
      'editor.lineHighlightBackground': '#18181b',
      'editorLineNumber.foreground': '#3f3f46',
      'editorLineNumber.activeForeground': '#a1a1aa',
      'editor.selectionBackground': '#27272a',
      'editorCursor.foreground': '#fafafa',
      'editorIndentGuide.background': '#1f1f1f',
      'editorIndentGuide.activeBackground': '#2a2a2a',
    },
  })
  monaco.editor.setTheme('better')
}

export const CodePanel = ({ code, onChange }: CodePanelProps) => (
  <div className="code-panel">
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={code}
      onChange={(val) => onChange(val ?? '')}
      theme="better"
      onMount={handleMount}
      options={{
        fontSize: 13,
        fontFamily: 'Geist Mono, SF Mono, Menlo, Monaco, monospace',
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        tabSize: 2,
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: 'none',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
      }}
    />
  </div>
)
