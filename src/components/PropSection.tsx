export const PropSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="props-section">
    <div className="props-section-title">{title}</div>
    {children}
  </div>
)
