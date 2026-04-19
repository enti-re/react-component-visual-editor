export const HoverHighlight = ({ rect, mountEl }: { rect: DOMRect; mountEl: HTMLDivElement | null }) => {
  if (!mountEl?.parentElement) return null
  const containerRect = mountEl.parentElement.getBoundingClientRect()
  return (
    <div
      className="preview-hover"
      style={{
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
        width: rect.width,
        height: rect.height,
      }}
    />
  )
}
