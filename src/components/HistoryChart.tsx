import { useEffect, useRef } from 'react'
import type { CountSample } from '../types'

interface HistoryChartProps {
  history: CountSample[]
  threshold: number
}

export function HistoryChart({ history, threshold }: HistoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    if (history.length < 2) return

    const maxCount = Math.max(threshold, ...history.map((h) => h.count), 1)
    const padding = 6
    const plotHeight = height - padding * 2
    const stepX = width / (history.length - 1)

    const yFor = (count: number) => padding + plotHeight - (count / maxCount) * plotHeight

    // Threshold line.
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.6)'
    ctx.setLineDash([4, 4])
    ctx.lineWidth = 1
    ctx.beginPath()
    const thresholdY = yFor(threshold)
    ctx.moveTo(0, thresholdY)
    ctx.lineTo(width, thresholdY)
    ctx.stroke()
    ctx.setLineDash([])

    // Filled area under the curve.
    ctx.beginPath()
    ctx.moveTo(0, yFor(history[0].count))
    history.forEach((sample, i) => ctx.lineTo(i * stepX, yFor(sample.count)))
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(34, 229, 168, 0.35)')
    gradient.addColorStop(1, 'rgba(34, 229, 168, 0)')
    ctx.fillStyle = gradient
    ctx.fill()

    // Line.
    ctx.beginPath()
    ctx.moveTo(0, yFor(history[0].count))
    history.forEach((sample, i) => ctx.lineTo(i * stepX, yFor(sample.count)))
    ctx.strokeStyle = '#22e5a8'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [history, threshold])

  return <canvas ref={canvasRef} className="history-chart" />
}
