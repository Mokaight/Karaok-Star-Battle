import { useCallback, useRef, useState } from 'react'
import { useYouTubePlayer } from './useYouTubePlayer'
import { useMediaRecorder } from './useMediaRecorder'
import { useAnalyser } from './useAnalyser'
import { useWaveform } from './useWaveform'
import { useScoreCalculator } from './useScoreCalculator'
import { useAudioStore } from '@/stores/audioStore'
import type { ScoreResult } from '@/types'

interface UseAudioEngineOptions {
  videoId: string
  onSongEnded?: () => void
}

export function useAudioEngine({ videoId, onSongEnded }: UseAudioEngineOptions) {
  const [isStarted, setIsStarted] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const amplitudeHistoryRef = useRef<number[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)

  const { appendAmplitude, setRecordingBlob } = useAudioStore()
  const { calculate } = useScoreCalculator()

  const { pushAmplitude, startDrawing, stopDrawing, canvasRef } = useWaveform()

  const { connect: connectAnalyser, disconnect: disconnectAnalyser } = useAnalyser({
    onAmplitude: (rms) => {
      pushAmplitude(rms)
      amplitudeHistoryRef.current.push(rms)
      appendAmplitude(rms)
    },
  })

  const { startRecording, stopRecording, cleanup: cleanupRecorder, error: micError, requestPermission, micReady } = useMediaRecorder()

  const handleSongEnded = useCallback(async () => {
    const blob = await stopRecording()
    disconnectAnalyser()
    stopDrawing()
    if (blob) setRecordingBlob(blob)

    const scoreResult = calculate(amplitudeHistoryRef.current)
    setResult(scoreResult)
    onSongEnded?.()
  }, [stopRecording, disconnectAnalyser, stopDrawing, setRecordingBlob, calculate, onSongEnded])

  const {
    containerRef: ytContainerRef,
    isReady: ytReady,
    play: ytPlay,
    pause: ytPause,
    unMute: ytUnmute,
    getCurrentTime,
    getDuration,
  } = useYouTubePlayer({
    videoId,
    onEnded: handleSongEnded,
  })

  const start = useCallback(async () => {
    amplitudeHistoryRef.current = []

    // Solution 2 — AudioContext gate : créé SYNCHRONE dans le geste utilisateur.
    // iOS voit un contexte audio actif → ouvre une session mixte play+record
    // au lieu de trancher entre YouTube et le micro.
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    audioCtxRef.current = ctx
    ctx.resume().catch(() => {})

    // Solution 1 — unmute AVANT tout await, toujours dans le geste synchrone.
    // Le stream micro est déjà capturé (requestPermission au mount) → startRecording
    // ne rappelle pas getUserMedia, juste new MediaRecorder().
    ytUnmute()
    ytPlay()

    const stream = await startRecording()
    if (!stream) {
      ytPause()
      return
    }

    // Passe le ctx déjà actif à l'analyser — pas de second AudioContext créé.
    connectAnalyser(stream, ctx)
    startDrawing()
    setIsStarted(true)
  }, [startRecording, connectAnalyser, startDrawing, ytUnmute, ytPause, ytPlay])

  const forceStop = useCallback(async () => {
    await handleSongEnded()
  }, [handleSongEnded])

  const cleanup = useCallback(() => {
    disconnectAnalyser()
    stopDrawing()
    cleanupRecorder()
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    amplitudeHistoryRef.current = []
  }, [disconnectAnalyser, stopDrawing, cleanupRecorder])

  return {
    ytContainerRef,
    canvasRef,
    ytReady,
    micReady,
    isStarted,
    result,
    micError,
    start,
    forceStop,
    cleanup,
    requestPermission,
    getCurrentTime,
    getDuration,
  }
}
