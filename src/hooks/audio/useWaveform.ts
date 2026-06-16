import { useRef, useCallback, useEffect } from 'react'

export function useWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const amplitudesRef = useRef<number[]>([])
  const rafRef = useRef<number>(0)

  const pushAmplitude = useCallback((rms: number) => {
    amplitudesRef.current.push(rms)
    if (amplitudesRef.current.length > 60) {
      amplitudesRef.current.shift()
    }
  }, [])

  const startDrawing = useCallback(() => {
    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const amplitudes = amplitudesRef.current
      if (amplitudes.length === 0) {
        // Ligne plate au repos
        ctx.strokeStyle = 'rgba(201, 168, 224, 0.4)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.stroke()
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const barWidth = width / 60
      const gap = 2

      amplitudes.forEach((amp, i) => {
        const barHeight = Math.max(4, amp * height * 3)
        const x = i * barWidth
        const y = (height - barHeight) / 2

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        gradient.addColorStop(0, '#C9A8E0')
        gradient.addColorStop(0.5, '#F4A0C8')
        gradient.addColorStop(1, '#FBBF8A')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x + gap / 2, y, barWidth - gap, barHeight, 4)
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  const stopDrawing = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    amplitudesRef.current = []
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return { canvasRef, pushAmplitude, startDrawing, stopDrawing }
}
