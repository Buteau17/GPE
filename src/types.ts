export interface DetectionBox {
  x: number
  y: number
  width: number
  height: number
  score: number
}

export interface CountSample {
  t: number
  count: number
}

export interface AlertEntry {
  t: number
  count: number
  threshold: number
}

export type VideoSource = 'webcam' | 'upload'

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error'
