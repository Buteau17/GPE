import { useEffect, useRef, useState } from 'react'
import type * as cocoSsd from '@tensorflow-models/coco-ssd'
import type { VideoSource } from '../types'

interface VideoPanelProps {
  modelRef: React.RefObject<cocoSsd.ObjectDetection | null>
  modelReady: boolean
  running: boolean
  source: VideoSource
  uploadUrl: string | null
  confidence: number
  onDetection: (count: number, fps: number) => void
  onStreamError: (message: string | null) => void
}

const DETECTION_INTERVAL_MS = 130

export function VideoPanel({
  modelRef,
  modelReady,
  running,
  source,
  uploadUrl,
  confidence,
  onDetection,
  onStreamError,
}: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastRunRef = useRef(0)
  const frameTimesRef = useRef<number[]>([])
  const [videoReady, setVideoReady] = useState(false)

  // Attach webcam or uploaded file to the <video> element.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setVideoReady(false)

    let cancelled = false

    async function attachWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled || !video) return
        streamRef.current = stream
        video.srcObject = stream
        await video.play()
        onStreamError(null)
      } catch {
        onStreamError('Could not access the webcam. Check browser permissions and try again.')
      }
    }

    if (source === 'webcam') {
      attachWebcam()
    } else if (source === 'upload' && uploadUrl) {
      video.srcObject = null
      video.src = uploadUrl
      video.loop = true
      video.muted = true
      video.play().catch(() => onStreamError('Could not play the uploaded video file.'))
      onStreamError(null)
    }

    return () => {
      cancelled = true
      const stream = streamRef.current
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [source, uploadUrl, onStreamError])

  // Detection loop.
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    async function loop(timestamp: number) {
      rafRef.current = requestAnimationFrame(loop)
      if (!running || !modelReady || !modelRef.current || !video || !canvas) return
      if (video.readyState < 2 || video.videoWidth === 0) return
      if (timestamp - lastRunRef.current < DETECTION_INTERVAL_MS) return
      lastRunRef.current = timestamp

      if (!videoReady) setVideoReady(true)

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const predictions = await modelRef.current.detect(video)
      const people = predictions.filter((p) => p.class === 'person' && p.score >= confidence)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = Math.max(2, canvas.width / 400)
      ctx.font = `${Math.max(14, canvas.width / 60)}px system-ui, sans-serif`
      ctx.strokeStyle = '#22e5a8'
      ctx.fillStyle = '#22e5a8'

      for (const person of people) {
        const [x, y, w, h] = person.bbox
        ctx.strokeRect(x, y, w, h)
        const label = `${Math.round(person.score * 100)}%`
        const labelWidth = ctx.measureText(label).width + 8
        ctx.fillRect(x, Math.max(0, y - 20), labelWidth, 20)
        ctx.fillStyle = '#03150f'
        ctx.fillText(label, x + 4, Math.max(14, y - 5))
        ctx.fillStyle = '#22e5a8'
      }

      const now = performance.now()
      frameTimesRef.current.push(now)
      frameTimesRef.current = frameTimesRef.current.filter((t) => now - t < 1000)
      onDetection(people.length, frameTimesRef.current.length)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [running, modelReady, modelRef, confidence, onDetection, videoReady])

  return (
    <div className="video-panel">
      <video ref={videoRef} playsInline muted className="video-el" />
      <canvas ref={canvasRef} className="overlay-el" />
      {!videoReady && (
        <div className="video-placeholder">
          {source === 'upload' && !uploadUrl
            ? 'Upload a video file to begin analysis'
            : 'Waiting for video feed…'}
        </div>
      )}
    </div>
  )
}
