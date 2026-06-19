import { useEffect, useRef, useState, useCallback } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

interface UseYouTubePlayerOptions {
  videoId: string
  onEnded?: () => void
  onReady?: () => void
  autoplay?: 0 | 1
  mute?: 0 | 1
  // Si true, le player n'est pas créé tant que enabled=false (micro-first iOS)
  enabled?: boolean
}

export function useYouTubePlayer({ videoId, onEnded, onReady, autoplay = 1, mute = 1, enabled = true }: UseYouTubePlayerOptions) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Refs pour les callbacks — évite les stale closures qui recréent le player
  const onEndedRef = useRef(onEnded)
  const onReadyRef = useRef(onReady)
  onEndedRef.current = onEnded
  onReadyRef.current = onReady

  useEffect(() => {
    setIsReady(false)
  }, [videoId])

  const initPlayer = useCallback(() => {
    // Bug fix : passer l'ID string au lieu du noeud DOM.
    // YT.Player remplace le div par un iframe — React perdait la référence au noeud
    // et re-rendait un nouveau div sur chaque update, détruisant le player.
    if (!document.getElementById('yt-player') || !window.YT?.Player || !videoId) return

    playerRef.current?.destroy?.()

    playerRef.current = new window.YT.Player('yt-player', {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay,
        mute,
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        rel: 0,
        iv_load_policy: 3,
        // origin requis pour éviter l'erreur postMessage cross-origin
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          setIsReady(true)
          onReadyRef.current?.()
        },
        onStateChange: (event: any) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
          if (event.data === window.YT.PlayerState.ENDED) {
            onEndedRef.current?.()
          }
        },
      },
    })
  }, [videoId, autoplay, mute])

  useEffect(() => {
    if (!videoId || !enabled) return

    if (window.YT?.Player) {
      // API déjà chargée — initialiser directement
      // Léger délai pour que le DOM soit prêt (le div doit exister)
      const t = setTimeout(initPlayer, 0)
      return () => clearTimeout(t)
    }

    if (!document.getElementById('youtube-api-script')) {
      const script = document.createElement('script')
      script.id = 'youtube-api-script'
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }

    // Bug fix : ne pas écraser un callback existant (plusieurs instances)
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      initPlayer()
    }

    return () => {
      playerRef.current?.destroy?.()
      playerRef.current = null
    }
  }, [initPlayer, videoId, enabled])

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
