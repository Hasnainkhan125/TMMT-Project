"use client"

import { useEffect, useRef, useState } from "react"

interface LazyVideoProps {
  src: string
  className?: string
  poster?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  playsInline?: boolean
  "aria-label"?: string
}

// Helper function to detect and convert YouTube URLs
function getYouTubeEmbedUrl(url: string): string | null {
  // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/)
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${shortsMatch[1]}&controls=0&modestbranding=1&rel=0&showinfo=0`
  }

  // Regular YouTube: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${watchMatch[1]}&controls=0&modestbranding=1&rel=0&showinfo=0`
  }

  return null
}

// Helper function to check if URL is a YouTube URL
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

export default function LazyVideo({
  src,
  className = "",
  poster,
  autoplay = false,
  loop = false,
  muted = true,
  controls = false,
  playsInline = true,
  "aria-label": ariaLabel,
  ...props
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [loaded, setLoaded] = useState(false)

  const isYouTube = isYouTubeUrl(src)
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(src) : null

  useEffect(() => {
    if (isYouTube) {
      // For YouTube videos, we just need to ensure the iframe loads when visible
      const el = iframeRef.current
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setLoaded(true)
            }
          })
        },
        {
          rootMargin: "50px",
          threshold: 0.1,
        }
      )

      observer.observe(el)
      return () => observer.disconnect()
    } else {
      // Original video logic for regular video files
      const el = videoRef.current
      if (!el) return

      let observer: IntersectionObserver | null = null

      const onIntersect: IntersectionObserverCallback = (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting && !loaded) {
            // Set the src attribute to start loading
            el.src = src
            el.load()

            // If autoplay is enabled, try to play when ready
            if (autoplay) {
              const playVideo = async () => {
                try {
                  await el.play()
                } catch (error) {
                  // Autoplay might be blocked
                  console.log("Autoplay blocked:", error)
                }
              }

              if (el.readyState >= 3) {
                // Video is already loaded enough to play
                playVideo()
              } else {
                // Wait for video to load enough data
                el.addEventListener("canplay", playVideo, { once: true })
              }
            }

            setLoaded(true)
            // Don't disconnect observer - we want to keep monitoring visibility
          } else if (!entry.isIntersecting && loaded && autoplay) {
            // Video is out of view and has autoplay - pause it but keep it loaded
            try {
              el.pause()
            } catch (error) {
              console.log("Error pausing video:", error)
            }
          } else if (entry.isIntersecting && loaded && autoplay) {
            // Video is back in view and has autoplay - resume playing
            try {
              await el.play()
            } catch (error) {
              console.log("Error resuming video:", error)
            }
          }
        })
      }

      observer = new IntersectionObserver(onIntersect, {
        rootMargin: "50px", // Start loading 50px before entering viewport
        threshold: 0.1,
      })
      observer.observe(el)

      return () => observer?.disconnect()
    }
  }, [src, loaded, autoplay, isYouTube])

  // Render YouTube iframe if it's a YouTube URL
  if (isYouTube && embedUrl) {
    return (
      <iframe
        ref={iframeRef}
        src={loaded ? embedUrl : undefined}
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        aria-label={ariaLabel}
        title="Video player"
      />
    )
  }

  // Render regular video element for non-YouTube URLs
  return (
    <video
      ref={videoRef}
      className={className}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      preload="none"
      poster={poster}
      aria-label={ariaLabel}
      {...props}
    >
      Your browser does not support the video tag.
    </video>
  )
}
