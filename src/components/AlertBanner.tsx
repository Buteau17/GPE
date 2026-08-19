import type { AlertEntry } from '../types'

interface AlertBannerProps {
  active: boolean
  currentCount: number
  threshold: number
  log: AlertEntry[]
}

export function AlertBanner({ active, currentCount, threshold, log }: AlertBannerProps) {
  return (
    <div className={`panel alert-panel ${active ? 'alert-active' : ''}`}>
      <h2>Alert status</h2>
      {active ? (
        <div className="alert-message">
          ⚠ Crowd limit exceeded — {currentCount} people detected (limit {threshold})
        </div>
      ) : (
        <div className="alert-message ok">✓ Crowd level within the safe limit ({threshold})</div>
      )}

      {log.length > 0 && (
        <ul className="alert-log">
          {log
            .slice(-5)
            .reverse()
            .map((entry) => (
              <li key={entry.t}>
                {new Date(entry.t).toLocaleTimeString()} — {entry.count} people (limit {entry.threshold})
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
