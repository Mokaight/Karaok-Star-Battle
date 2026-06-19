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

  const { startRecordingSync, stopRecording, cleanup: cleanupRecorder, error: micError, requestPermission, micReady } = useMediaRecorder()

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

  // Entièrement synchrone — aucun await dans le geste utilisateur.
  // iOS Safari maintient le contexte de geste pour toute la fonction synchrone,
  // ce qui permet à ytUnmute/ytPlay d'être acceptés après AudioContext et MediaRecorder.
  const start = useCallback(() => {
    amplitudeHistoryRef.current = []

    // 1. AudioContext gate : iOS ouvre une session audio mixte play+record
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    audioCtxRef.current = ctx
    ctx.resume().catch(() => {})

    // 2. Démarrer l'enregistrement depuis le stream déjà capturé (synchrone)
    const stream = startRecordingSync()
    if (!stream) return

    // 3. Démarrer YouTube avec le son — toujours dans le même geste synchrone
    ytUnmute()
    ytPlay()

    // 4. Connecter l'analyser au AudioContext déjà actif
    connectAnalyser(stream, ctx)
    startDrawing()
    setIsStarted(true)
  }, [startRecordingSync, connectAnalyser, startDrawing, ytUnmute, ytPlay])

  const forceStop = useCallback(async () => {
    ytPause()
    await handleSongEnded()
  }, [handleSongEnded, ytPause])

  const cleanup = useCallback(() => {
    ytPause()
    disconnectAnalyser()
    stopDrawing()
    cleanupRecorder()
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    amplitudeHistoryRef.current = []
  }, [ytPause, disconnectAnalyser, stopDrawing, cleanupRecorder])

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
