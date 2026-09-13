import { useEffect, useRef } from 'react'
import { getUploadsPlaylist } from './channels.js'

let youtubeApiPromise

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      resolve(window.YT)
    }

    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (existing) return

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => reject(new Error('YouTube player could not be loaded.'))
    document.head.appendChild(script)
  })

  return youtubeApiPromise
}

export default function YouTubePlaylistPlayer({ channel, initialVideoId, playerApiRef, onMetaChange }) {
  const hostRef = useRef(null)

  useEffect(() => {
    let disposed = false
    let player
    let refreshTimer

    const publishMeta = (target, overrides = {}) => {
      if (disposed || !target) return
      const playlist = target.getPlaylist?.() || []
      const rawIndex = target.getPlaylistIndex?.()
      const videoData = target.getVideoData?.() || {}
      onMetaChange({
        ready: true,
        error: '',
        index: Number.isFinite(rawIndex) && rawIndex >= 0 ? rawIndex : 0,
        total: playlist.length,
        title: videoData.title || channel.title,
        videoId: videoData.video_id || initialVideoId,
        ...overrides,
      })
    }

    onMetaChange({
      ready: false,
      error: '',
      index: 0,
      total: 0,
      title: channel.title,
      videoId: initialVideoId,
    })

    loadYouTubeApi()
      .then((YT) => {
        if (disposed || !hostRef.current) return

        player = new YT.Player(hostRef.current, {
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          videoId: initialVideoId,
          playerVars: {
            listType: 'playlist',
            list: getUploadsPlaylist(channel),
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            cc_load_policy: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              target.getIframe()?.setAttribute('title', `${channel.name} complete uploads playlist`)
              publishMeta(target)
              refreshTimer = window.setTimeout(() => publishMeta(target), 900)
            },
            onStateChange: ({ target }) => publishMeta(target),
            onError: ({ data }) => {
              onMetaChange((current) => ({
                ...current,
                ready: false,
                error: `YouTube playback error ${data}`,
              }))
            },
          },
        })

        playerApiRef.current = {
          nextVideo: () => player?.nextVideo?.(),
          previousVideo: () => player?.previousVideo?.(),
          playVideoAt: (index) => player?.playVideoAt?.(index),
          loadVideoById: (videoId) => player?.loadVideoById?.(videoId),
        }
      })
      .catch((error) => {
        if (!disposed) {
          onMetaChange((current) => ({ ...current, ready: false, error: error.message }))
        }
      })

    return () => {
      disposed = true
      window.clearTimeout(refreshTimer)
      playerApiRef.current = null
      player?.destroy?.()
    }
  }, [channel, initialVideoId, onMetaChange, playerApiRef])

  return <div className="youtube-player"><div ref={hostRef} /></div>
}
