import { useState, useEffect, useCallback } from 'react'
import { WebsiteEditor } from './components/WebsiteEditor'
import { createComponent, getComponent, updateComponent } from './api'
import { pushRecent, extractLabel } from './recents'
import { ShareFeedback } from './templates/ShareFeedback'

const DEFAULT_COMPONENT = ShareFeedback

function getIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('id')
}

function setIdInUrl(id: string) {
  const url = new URL(window.location.href)
  url.searchParams.set('id', id)
  window.history.replaceState(null, '', url.toString())
}

function App() {
  const [initialCode, setInitialCode] = useState<string | null>(null)
  const [componentId, setComponentId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isDirty, setIsDirty] = useState(false)
  const [savedCode, setSavedCode] = useState<string>(DEFAULT_COMPONENT)
  const [editorKey, setEditorKey] = useState(0)
  const [componentName, setComponentName] = useState<string>(extractLabel(DEFAULT_COMPONENT))

  useEffect(() => {
    const id = getIdFromUrl()
    if (id) {
      getComponent(id)
        .then((record) => {
          setComponentId(record.id)
          setInitialCode(record.code)
          setSavedCode(record.code)
          setComponentName(extractLabel(record.code))
        })
        .catch(() => setInitialCode(DEFAULT_COMPONENT))
    } else {
      setInitialCode(DEFAULT_COMPONENT)
    }
  }, [])

  const persist = useCallback(async (code: string, id: string | null): Promise<string> => {
    if (id) {
      await updateComponent(id, code)
      return id
    } else {
      const { id: newId } = await createComponent(code)
      return newId
    }
  }, [])

  // Called on: Save button click + visual property changes (color, size, text)
  const handleSave = useCallback(
    async (code: string) => {
      setSaveStatus('saving')
      try {
        const id = await persist(code, componentId)
        if (!componentId) {
          setComponentId(id)
          setIdInUrl(id)
        }
        setSaveStatus('saved')
        setIsDirty(false)
        setSavedCode(code)
        pushRecent(id, code, componentName)
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    },
    [componentId, persist]
  )

  const handleCodeChange = useCallback(() => {
    setIsDirty(true)
  }, [])

  const handleRevert = useCallback(() => {
    setInitialCode(savedCode)
    setIsDirty(false)
  }, [savedCode])

  const handleNew = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Start fresh anyway?')) return
    const url = new URL(window.location.href)
    url.searchParams.delete('id')
    window.history.replaceState(null, '', url.toString())
    setComponentId(null)
    setInitialCode(DEFAULT_COMPONENT)
    setSavedCode(DEFAULT_COMPONENT)
    setComponentName(extractLabel(DEFAULT_COMPONENT))
    setIsDirty(false)
    setSaveStatus('idle')
    setEditorKey(k => k + 1)
  }, [isDirty])

  const handleLoadRecent = useCallback(async (id: string) => {
    try {
      const record = await getComponent(id)
      setComponentId(record.id)
      setInitialCode(record.code)
      setSavedCode(record.code)
      setComponentName(extractLabel(record.code))
      setIsDirty(false)
      setSaveStatus('idle')
      setEditorKey(k => k + 1)
      setIdInUrl(record.id)
    } catch {
      alert('Could not load component — it may have been deleted.')
    }
  }, [])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
  }, [])

  if (initialCode === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: '#525252', fontFamily: 'sans-serif', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  return (
    <WebsiteEditor
      key={editorKey}
      initialCode={initialCode}
      saveStatus={saveStatus}
      isDirty={isDirty}
      componentId={componentId}
      componentName={componentName}
      onSave={handleSave}
      onCodeChange={handleCodeChange}
      onRevert={handleRevert}
      onNew={handleNew}
      onLoadRecent={handleLoadRecent}
      onCopyLink={handleCopyLink}
      onNameChange={setComponentName}
    />
  )
}

export default App
