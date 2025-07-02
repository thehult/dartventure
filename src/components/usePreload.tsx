import { useEffect, useState } from 'react'

export const usePreload = (imageUrl: string) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
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
