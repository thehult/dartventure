import { createContext, useContext, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Scene } from '@/types/Scene'
import { scenes, type SceneId } from '@/scenes/scenes'
import { useSessionStorage } from 'usehooks-ts'

type SceneContext = {
  sceneId: SceneId
  scene: Scene
  navigateToScene: (sceneId: SceneId) => void
}

const SceneContextImpl = createContext<SceneContext>(null!)

export const useScene = () => useContext(SceneContextImpl)

type SceneContextProviderProps = {
  children?: React.ReactNode
}

export const SceneContextProvider: React.FC<SceneContextProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate()
  const [sceneId, setSceneId] = useSessionStorage<SceneId>('sceneId', 'world')
  const scene = useMemo(() => scenes[sceneId] as Scene, [sceneId])

  const navigateToScene = (sceneId: SceneId) => {
    setSceneId(sceneId)
    navigate({ to: '/game' })
  }

  return (
    <SceneContextImpl value={{ sceneId, scene, navigateToScene }}>
      {children}
    </SceneContextImpl>
  )
}
