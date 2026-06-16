import { useRef, useCallback } from 'react'
import { SCORING } from '@/config/scoring'

interface UseAnalyserOptions {
  onAmplitude?: (rms: number) => void
}

export function useAnalyser({ onAmplitude }: UseAnalyserOptions = {}) {
  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const rafRef = useRef<number>(0)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  const connect = useCallback((stream: MediaStream) => {
    const context = new AudioContext()
    contextRef.current = context

    const analyser = context.createAnalyser()
    analyser.fftSize = SCORING.ANALYSER_FFT_SIZE
    analyser.smoothingTimeConstant = SCORING.ANALYSER_SMOOTHING
    analyserRef.current = analyser

    const source = context.createMediaStreamSource(stream)
    source.connect(analyser)
    sourceRef.current = source

    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      if (!analyserRef.current || !dataArrayRef.current) return
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current)

      // Calcul RMS
      let sum = 0
      for (const v of dataArrayRef.current) {
        const normalized = (v - 128) / 128
        sum += normalized * normalized
      }
      const rms = Math.sqrt(sum / dataArrayRef.current.length)
      onAmplitude?.(rms)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [onAmplitude])

  const disconnect = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    sourceRef.current?.disconnect()
    analyserRef.current?.disconnect()
    contextRef.current?.close()
    contextRef.current = null
    analyserRef.current = null
  }, [])

  const getFrequencyData = useCallback((): Uint8Array | null => {
    if (!analyserRef.current || !dataArrayRef.current) return null
    analyserRef.current.getByteFrequencyData(dataArrayRef.current)
    return dataArrayRef.current
  }, [])

  return { connect, disconnect, getFrequencyData, analyserRef }
}
