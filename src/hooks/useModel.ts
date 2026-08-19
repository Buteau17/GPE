import { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import type { ModelStatus } from '../types'

/** Loads the COCO-SSD person detector once and keeps it warm for reuse. */
export function useModel() {
  const [status, setStatus] = useState<ModelStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        await tf.ready()
        const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
        if (cancelled) return
        modelRef.current = model
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load model')
        setStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { modelRef, status, error }
}
