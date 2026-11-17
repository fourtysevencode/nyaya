import { useEffect, useState } from 'react'

/**
 * Object URL for a blob (image/video/audio previews). Created in an effect
 * and revoked when it changes or on unmount. Using an effect (not a
 * render-time memo) is what makes this StrictMode-safe: the double
 * mount/unmount cycle revokes the first URL and creates a fresh one.
 */
export function useObjectUrl(blob) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!blob) return undefined
    const objectUrl = URL.createObjectURL(blob)
    // Synchronizing with the browser's object-URL registry; the warning is a
    // false positive here (the canonical pattern from the React docs).
    // oxlint-disable-next-line react/set-state-in-effect
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])
  return url
}
