export default function AuthCard({ children, subtitle }) {
  return (
    <div className="max-w-md mx-auto bg-sf-card border border-sf-border rounded-2xl shadow-xl p-8 text-center">
      <h1 className="text-2xl font-semibold text-sf-foreground mb-2">ScaleFlow</h1>
      <p className="text-sf-muted text-sm mb-8">{subtitle}</p>
      {children}
    </div>
  )
}
