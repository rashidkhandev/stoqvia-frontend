export default function StatCard({ label, value, delta, deltaTone = 'up', icon: Icon, accent = 'teal' }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className="stat-icon">
            <Icon size={16} strokeWidth={2.2} />
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {delta && <div className={`stat-delta stat-delta--${deltaTone}`}>{delta}</div>}
    </div>
  )
}
