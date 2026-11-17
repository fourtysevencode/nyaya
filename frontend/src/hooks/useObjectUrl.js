import { useEffect, useMemo } from 'react'

/**
 * Object URL for a blob (images, video and audio previews). The URL is
 * derived during render and revoked when it changes or on unmount.
 */
export function useObjectUrl(blob) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])
  return url
}
