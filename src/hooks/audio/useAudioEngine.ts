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
  audioUrl: string | null  // blob URL pré-chargé — null = pas encore prêt
  onSongEnded?: () => void
}

export function useAudioEngine({ videoId, audioUrl, onSongEnded }: UseAudioEngineOptions) {
  const [isStarted, setIsStarted] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const amplitudeHistoryRef = useRef<number[]>([])
  const audioElRef = useRef<HTMLAudioElement | null>(null)
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

  const {
    containerRef: ytContainerRef,
    isReady: ytReady,
    play: ytPlay,
    pause: ytPause,
  } = useYouTubePlayer({ videoId })

  const handleSongEnded = useCallback(async () => {
    if (audioElRef.current) {
      audioElRef.current.pause()
      audioElRef.current.onended = null
    }
    ytPause()
    const blob = await stopRecording()
    disconnectAnalyser()
    stopDrawing()
    if (blob) setRecordingBlob(blob)
    const scoreResult = calculate(amplitudeHistoryRef.current)
    setResult(scoreResult)
    onSongEnded?.()
  }, [ytPause, stopRecording, disconnectAnalyser, stopDrawing, setRecordingBlob, calculate, onSongEnded])

  const start = useCallback(async () => {
    if (!audioUrl) return
    amplitudeHistoryRef.current = []

    // AudioContext gate — iOS ouvre une session audio mixte play+record dans le geste synchrone
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    audioCtxRef.current = ctx
    ctx.resume().catch(() => {})

    // Créer et démarrer l'audio depuis le blob pré-chargé (synchrone dans le geste)
    const audio = new Audio(audioUrl)
    audioElRef.current = audio
    audio.play().catch(() => {})

    // Démarrer la vidéo YouTube en muet (synchronisation visuelle)
    ytPlay()

    // Partie async : démarrer l'enregistrement micro
    const stream = await startRecording()
    if (!stream) {
      audio.pause()
      ytPause()
      return
    }

    audio.onended = () => { handleSongEnded() }

    connectAnalyser(stream, ctx)
    startDrawing()
    setIsStarted(true)
  }, [audioUrl, startRecording, connectAnalyser, startDrawing, ytPlay, ytPause, handleSongEnded])

  const getCurrentTime = useCallback((): number => {
    return audioElRef.current?.currentTime ?? 0
  }, [])

  const getDuration = useCallback((): number => {
    return audioElRef.current?.duration ?? 0
  }, [])

  const forceStop = useCallback(async () => {
    await handleSongEnded()
  }, [handleSongEnded])

  const cleanup = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause()
      audioElRef.current.onended = null
      audioElRef.current = null
    }
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
