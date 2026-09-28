import { useMemo } from 'react'
import { useGameFlow } from './useGameFlow'
import { scenes } from '@/scenes/scenes'
import type { Scene } from '@/types/Scene'

export const useScene = () => {
  const { sceneId } = useGameFlow()
  const scene = useMemo(() => scenes[sceneId] as Scene, [sceneId])

  return { sceneId, scene }
}
