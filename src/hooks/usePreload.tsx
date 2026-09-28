import { useEffect, useState } from 'react'

export const usePreload = (imageUrl: string | undefined | null) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!imageUrl) {
      setTimeout(() => setLoaded(true), 10)

      return
    }
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      setLoaded(true)
    }
    img.onerror = () => {
      console.error('Image failed to load')
    }
  }, [imageUrl])

  return loaded
}
