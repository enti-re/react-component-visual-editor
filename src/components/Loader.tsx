const LOADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: '#0a0a0a',
  color: '#525252',
  fontFamily: 'sans-serif',
  fontSize: 14,
}

export default function Loader() {
  return (
    <div style={LOADER_STYLE}>
      Loading…
    </div>
  )
}
