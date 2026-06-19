import { useRef, useState, useCallback } from 'react'

export function useMediaRecorder() {
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [micReady, setMicReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestPermission = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
      setMicReady(true)
      return stream
    } catch {
      setError('Microphone non autorisé — vérifie les permissions du navigateur')
      return null
    }
  }, [])

  const startRecording = useCallback(async (): Promise<MediaStream | null> => {
    const stream = streamRef.current ?? await requestPermission()
    if (!stream) return null

    chunksRef.current = []
    // Ordre de préférence : webm/opus (Chrome, Firefox, Android) → webm → ogg → mp4 (Safari) → défaut navigateur
    const mimeType = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ].find((t) => MediaRecorder.isTypeSupported(t)) ?? ''

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    recorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start(100)
    setIsRecording(true)
    return stream
  }, [requestPermission])

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        resolve(null)
        return
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setIsRecording(false)
        resolve(blob)
      }

      recorder.stop()
    })
  }, [])

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
  }, [])

  return { isRecording, micReady, error, requestPermission, startRecording, stopRecording, cleanup, streamRef }
}
