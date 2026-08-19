import type { ChangeEvent } from 'react'
import type { VideoSource } from '../types'

interface ControlsPanelProps {
  source: VideoSource
  onSourceChange: (source: VideoSource) => void
  onFileSelected: (file: File) => void
  running: boolean
  onToggleRunning: () => void
  threshold: number
  onThresholdChange: (value: number) => void
  confidence: number
  onConfidenceChange: (value: number) => void
  modelStatus: string
}

export function ControlsPanel({
  source,
  onSourceChange,
  onFileSelected,
  running,
  onToggleRunning,
  threshold,
  onThresholdChange,
  confidence,
  onConfidenceChange,
  modelStatus,
}: ControlsPanelProps) {
  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div className="panel controls-panel">
      <h2>Controls</h2>

      <div className="field">
        <span className="field-label">Source</span>
        <div className="segmented">
          <button
            className={source === 'webcam' ? 'active' : ''}
            onClick={() => onSourceChange('webcam')}
          >
            Webcam
          </button>
          <button
            className={source === 'upload' ? 'active' : ''}
            onClick={() => onSourceChange('upload')}
          >
            Video file
          </button>
        </div>
      </div>

      {source === 'upload' && (
        <div className="field">
          <span className="field-label">Footage file</span>
          <input type="file" accept="video/*" onChange={handleFile} />
        </div>
      )}

      <div className="field">
        <button className="primary-btn" onClick={onToggleRunning} disabled={modelStatus !== 'ready'}>
          {running ? 'Pause monitoring' : 'Start monitoring'}
        </button>
        <span className="model-status">
          model: <strong>{modelStatus}</strong>
        </span>
      </div>

      <div className="field">
        <label htmlFor="threshold">
          Safe capacity limit: <strong>{threshold}</strong> people
        </label>
        <input
          id="threshold"
          type="range"
          min={1}
          max={50}
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label htmlFor="confidence">
          Detection confidence: <strong>{Math.round(confidence * 100)}%</strong>
        </label>
        <input
          id="confidence"
          type="range"
          min={0.3}
          max={0.9}
          step={0.05}
          value={confidence}
          onChange={(e) => onConfidenceChange(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
