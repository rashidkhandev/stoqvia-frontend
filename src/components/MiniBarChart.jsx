export default function MiniBarChart({ title, data, unit = '' }) {
  const safeData = Array.isArray(data) && data.length > 0 ? data : [{ label: 'No data', value: 1 }]
  const max = Math.max(...safeData.map((d) => Number(d.value) || 0), 1)

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>{title}</h3>
      </div>
      <div className="mini-bar-chart">
        {safeData.map((d, index) => (
          <div className="mini-bar-col" key={`${d.label}-${index}`}>
            <div className="mini-bar-track">
              <div
                className="mini-bar-fill"
                style={{ height: `${((Number(d.value) || 0) / max) * 100}%` }}
                title={`${d.label}: ${unit}${d.value}`}
              />
            </div>
            <span className="mini-bar-label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
