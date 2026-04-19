export const FullPreviewIcon = ({ expanded }: { expanded: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {expanded ? (
      <>
        <path d="M9 4v4a1 1 0 0 1-1 1H4" />
        <path d="M15 4v4a1 1 0 0 0 1 1h4" />
        <path d="M9 20v-4a1 1 0 0 0-1-1H4" />
        <path d="M15 20v-4a1 1 0 0 1 1-1h4" />
      </>
    ) : (
      <>
        <path d="M4 9V5a1 1 0 0 1 1-1h4" />
        <path d="M20 9V5a1 1 0 0 0-1-1h-4" />
        <path d="M4 15v4a1 1 0 0 0 1 1h4" />
        <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
      </>
    )}
  </svg>
)
