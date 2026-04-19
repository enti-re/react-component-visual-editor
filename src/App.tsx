import { useState, useEffect } from 'react'
import { WebsiteEditor } from './components/WebsiteEditor'
import { getComponent } from './api'
import { ShareFeedback } from './templates/ShareFeedback'
import { getComponentIdFromUrl } from './helpers/urlParams'
import type { InitialComponent } from './types'
import Loader from './components/Loader'

const DEFAULT_COMPONENT = ShareFeedback

const loadInitialComponent = async (): Promise<InitialComponent> => {
  const id = getComponentIdFromUrl()
  if (id) {
    try {
      const record = await getComponent(id)
      return { code: record.code, id: record.id }
    } catch {
      return { code: DEFAULT_COMPONENT, id: null }
    }
  }
  return { code: DEFAULT_COMPONENT, id: null }
}

const App = () => {
  const [initial, setInitial] = useState<InitialComponent | null>(null)
  const [editorKey, setEditorKey] = useState(0)

  useEffect(() => {
    loadInitialComponent().then(setInitial)
  }, [])

  const handleReset = (code?: string, id?: string | null) => {
    setInitial({ code: code ?? DEFAULT_COMPONENT, id: id ?? null })
    setEditorKey(prev => prev + 1)
  }

  if (initial === null) return <Loader />

  return (
    <WebsiteEditor
      key={editorKey}
      initial={initial}
      onReset={handleReset}
    />
  )
}

export default App
