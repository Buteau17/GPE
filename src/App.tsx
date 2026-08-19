import { useCallback, useEffect, useRef, useState } from 'react'
import { useModel } from './hooks/useModel'
import { VideoPanel } from './components/VideoPanel'
import { ControlsPanel } from './components/ControlsPanel'
import { StatsPanel } from './components/StatsPanel'
import { AlertBanner } from './components/AlertBanner'
import { HistoryChart } from './components/HistoryChart'
import { playAlertBeep } from './utils/audio'
import type { AlertEntry, CountSample, VideoSource } from './types'

const HISTORY_LIMIT = 120
const SMOOTHING_WINDOW = 5
const ALERT_REPEAT_MS = 10_000

function App() {
  const { modelRef, status, error } = useModel()

  const [source, setSource] = useState<VideoSource>('webcam')
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [threshold, setThreshold] = useState(10)
  const [confidence, setConfidence] = useState(0.5)
  const [streamError, setStreamError] = useState<string | null>(null)

  const [currentCount, setCurrentCount] = useState(0)
  const [maxCount, setMaxCount] = useState(0)
  const [fps, setFps] = useState(0)
  const [history, setHistory] = useState<CountSample[]>([])
  const [alertActive, setAlertActive] = useState(false)
  const [alertLog, setAlertLog] = useState<AlertEntry[]>([])

  const rawCountsRef = useRef<number[]>([])
  const lastAlertBeepRef = useRef(0)

  useEffect(() => {
    if (status === 'ready' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [status])

  const handleSourceChange = useCallback((next: VideoSource) => {
    setSource(next)
    setRunning(false)
    setStreamError(null)
  }, [])

  const handleFileSelected = useCallback((file: File) => {
    setUploadUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }, [])

  const handleDetection = useCallback(
    (rawCount: number, currentFps: number) => {
      rawCountsRef.current.push(rawCount)
      if (rawCountsRef.current.length > SMOOTHING_WINDOW) rawCountsRef.current.shift()
      const smoothed = Math.round(
        rawCountsRef.current.reduce((sum, v) => sum + v, 0) / rawCountsRef.current.length,
      )

      setCurrentCount(smoothed)
      setFps(currentFps)
      setMaxCount((prev) => Math.max(prev, smoothed))
      setHistory((prev) => {
        const next = [...prev, { t: Date.now(), count: smoothed }]
        return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next
      })

      setThreshold((currentThreshold) => {
        const now = Date.now()
        const isOverLimit = smoothed >= currentThreshold
        setAlertActive((wasActive) => {
          if (isOverLimit) {
            if (!wasActive || now - lastAlertBeepRef.current > ALERT_REPEAT_MS) {
              lastAlertBeepRef.current = now
              playAlertBeep()
              setAlertLog((prevLog) => [...prevLog, { t: now, count: smoothed, threshold: currentThreshold }])
              if ('Notification' in window && Notification.permission === 'granted' && !wasActive) {
                new Notification('Crowd limit exceeded', {
                  body: `${smoothed} people detected — safe limit is ${currentThreshold}.`,
                })
              }
            }
            return true
          }
          // Hysteresis: only clear once comfortably below the limit to avoid flicker.
          if (smoothed <= currentThreshold - 1) return false
          return wasActive
        })
        return currentThreshold
      })
    },
    [],
  )

  const avgCount = history.length
    ? Math.round(history.reduce((sum, s) => sum + s.count, 0) / history.length)
    : 0

  return (
    <div className="app">
      <header className="app-header">
        <h1>Real-Time Crowd Counting System</h1>
        <p>Client-side person detection with live alerts — runs entirely in your browser.</p>
      </header>

      {error && <div className="banner error-banner">Model failed to load: {error}</div>}
      {streamError && <div className="banner error-banner">{streamError}</div>}

      <main className="layout">
        <div className="left-col">
          <VideoPanel
            modelRef={modelRef}
            modelReady={status === 'ready'}
            running={running}
            source={source}
            uploadUrl={uploadUrl}
            confidence={confidence}
            onDetection={handleDetection}
            onStreamError={setStreamError}
          />
          <div className="panel">
            <h2>Crowd count history</h2>
            <HistoryChart history={history} threshold={threshold} />
          </div>
        </div>

        <div className="right-col">
          <ControlsPanel
            source={source}
            onSourceChange={handleSourceChange}
            onFileSelected={handleFileSelected}
            running={running}
            onToggleRunning={() => setRunning((r) => !r)}
            threshold={threshold}
            onThresholdChange={setThreshold}
            confidence={confidence}
            onConfidenceChange={setConfidence}
            modelStatus={status}
          />
          <StatsPanel
            currentCount={currentCount}
            maxCount={maxCount}
            avgCount={avgCount}
            fps={fps}
            alertCount={alertLog.length}
          />
          <AlertBanner active={alertActive} currentCount={currentCount} threshold={threshold} log={alertLog} />
        </div>
      </main>

      <footer className="app-footer">
        Person detection powered by TensorFlow.js (COCO-SSD), running fully client-side — no video ever
        leaves your device.
      </footer>
    </div>
  )
}

export default App
