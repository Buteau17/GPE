let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AudioCtx()
  }
  return ctx
}

/** Plays a short warning beep using the Web Audio API — no audio asset needed. */
export function playAlertBeep() {
  const audioCtx = getContext()
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') audioCtx.resume()

  const now = audioCtx.currentTime
  ;[0, 0.22].forEach((offset) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(880, now + offset)
    gain.gain.setValueAtTime(0, now + offset)
    gain.gain.linearRampToValueAtTime(0.15, now + offset + 0.02)
    gain.gain.linearRampToValueAtTime(0, now + offset + 0.18)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(now + offset)
    osc.stop(now + offset + 0.2)
  })
}
