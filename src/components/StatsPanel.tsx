interface StatsPanelProps {
  currentCount: number
  maxCount: number
  avgCount: number
  fps: number
  alertCount: number
}

export function StatsPanel({ currentCount, maxCount, avgCount, fps, alertCount }: StatsPanelProps) {
  const stats = [
    { label: 'Current count', value: currentCount },
    { label: 'Peak count', value: maxCount },
    { label: 'Average count', value: avgCount },
    { label: 'Detections / sec', value: fps },
    { label: 'Alerts triggered', value: alertCount },
  ]

  return (
    <div className="panel stats-panel">
      <h2>Live stats</h2>
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-tile" key={s.label}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
