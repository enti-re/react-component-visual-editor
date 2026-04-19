export const ShareFeedback = `function ShareFeedback() {
  const [open, setOpen] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [text, setText] = React.useState('')

  function handleSubmit() {
    if (!text.trim()) return
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setText('')
      setOpen(false)
    }, 1800)
  }

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#fafafa', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', color: '#52525b', marginBottom: '20px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
        Now in public beta
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#18181b', margin: '0 0 12px', lineHeight: '1.2', letterSpacing: '-0.03em', maxWidth: '400px' }}>
        Build better products, faster
      </h1>
      <p style={{ fontSize: '15px', color: '#71717a', lineHeight: '1.6', margin: '0 0 28px', maxWidth: '340px' }}>
        Real-time analytics and instant alerts — all in one place.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={{ padding: '10px 20px', background: '#18181b', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          Get started
        </button>
        <button
          onClick={() => setOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#fff', color: '#18181b', border: '1px solid #e4e4e7', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Feedback
        </button>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '380px', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p style={{ color: '#18181b', fontSize: '15px', fontWeight: '600', margin: 0 }}>Thanks for the feedback!</p>
                <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>We read every message.</p>
              </div>
            ) : (
              <>
                <div>
                  <p style={{ color: '#18181b', fontSize: '15px', fontWeight: '600', margin: '0 0 4px' }}>Share your feedback</p>
                  <p style={{ color: '#71717a', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>What's on your mind? We'd love to hear it.</p>
                </div>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="I think it would be great if…"
                  rows={4}
                  style={{ width: '100%', padding: '12px', border: '1px solid #e4e4e7', borderRadius: '10px', fontSize: '13px', color: '#18181b', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setOpen(false)} style={{ padding: '8px 16px', border: '1px solid #e4e4e7', borderRadius: '8px', background: '#fff', color: '#52525b', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleSubmit} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#18181b', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: text.trim() ? 1 : 0.4 }}>
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}`
