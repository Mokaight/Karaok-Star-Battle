import { useEffect, useRef, useState, useCallback } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface UseYouTubePlayerOptions {
  videoId: string
  onEnded?: () => void
  onReady?: () => void
  autoplay?: 0 | 1
  mute?: 0 | 1
}

export function useYouTubePlayer({ videoId, onEnded, onReady, autoplay = 1, mute = 1 }: UseYouTubePlayerOptions) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setIsReady(false)
  }, [videoId])

  const initPlayer = useCallback(() => {
    if (!containerRef.current || !window.YT?.Player || !videoId) return

    playerRef.current?.destroy?.()

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        // autoplay muet : universellement autorisé (pas de blocage Firefox/Safari)
        // L'utilisateur unmute en appuyant sur le micro
        autoplay,
        mute,
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
      },
      events: {
        onReady: () => {
          setIsReady(true)
          onReady?.()
        },
        onStateChange: (event: any) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
          if (event.data === window.YT.PlayerState.ENDED) {
            onEnded?.()
          }
        },
      },
    })
  }, [videoId, onEnded, onReady])

  useEffect(() => {
    if (!videoId) return

    if (window.YT?.Player) {
      initPlayer()
      return
    }

    if (!document.getElementById('youtube-api-script')) {
      const script = document.createElement('script')
      script.id = 'youtube-api-script'
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }

    window.onYouTubeIframeAPIReady = initPlayer

    return () => {
      playerRef.current?.destroy?.()
    }
  }, [initPlayer, videoId])

  const play = useCallback(() => playerRef.current?.playVideo?.(), [])
  const pause = useCallback(() => playerRef.current?.pauseVideo?.(), [])
  const unMute = useCallback(() => playerRef.current?.unMute?.(), [])
  const stop = useCallback(() => {
    playerRef.current?.stopVideo?.()
    setIsPlaying(false)
  }, [])

  const getCurrentTime = useCallback((): number => {
    return playerRef.current?.getCurrentTime?.() ?? 0
  }, [])

  const getDuration = useCallback((): number => {
    return playerRef.current?.getDuration?.() ?? 0
  }, [])

  return { containerRef, isReady, isPlaying, play, pause, unMute, stop, getCurrentTime, getDuration }
}
