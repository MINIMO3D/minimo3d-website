'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * Stummes Hintergrundvideo für den Kopfbereich. Startet nur, wenn der Besucher
 * Animationen nicht abgeschaltet hat, und lässt sich jederzeit anhalten.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    video.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    )
  }, [])

  const toggle = () => {
    const video = ref.current
    if (!video) return
    if (video.paused) {
      video.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      )
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <video
        ref={ref}
        className="hero__video"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        className="hero__toggle"
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Video anhalten' : 'Video abspielen'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
          {playing ? <path d="M2 1h3.5v12H2zM8.5 1H12v12H8.5z" /> : <path d="M3 1l9 6-9 6z" />}
        </svg>
      </button>
    </>
  )
}
