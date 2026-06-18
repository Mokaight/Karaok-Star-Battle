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

  const { startRecording, stopRecording, cleanup: cleanupRecorder, error: micError, requestPermission } = useMediaRecorder()

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
    getCurrentTime,
    getDuration,
  } = useYouTubePlayer({
    videoId,
    onEnded: handleSongEnded,
  })

  const start = useCallback(async () => {
    amplitudeHistoryRef.current = []
    const stream = await startRecording()
    if (!stream) return
    connectAnalyser(stream)
    startDrawing()
    ytPlay()
    setIsStarted(true)
  }, [startRecording, connectAnalyser, startDrawing, ytPlay])

  const forceStop = useCallback(async () => {
    await handleSongEnded()
  }, [handleSongEnded])

  const cleanup = useCallback(() => {
    disconnectAnalyser()
    stopDrawing()
    cleanupRecorder()
    amplitudeHistoryRef.current = []
  }, [disconnectAnalyser, stopDrawing, cleanupRecorder])

  return {
    ytContainerRef,
    canvasRef,
    ytReady,
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
