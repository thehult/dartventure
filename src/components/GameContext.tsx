import { createContext, useContext, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Scene } from '@/types/Scene'
import { scenes, type SceneId } from '@/scenes/scenes'
import { useSessionStorage } from 'usehooks-ts'

type GameContext = {
  sceneId: SceneId
  scene: Scene
  navigateToScene: (sceneId: SceneId) => void
}

const GameContextImpl = createContext<GameContext>(null!)

export const useGameContext = () => useContext(GameContextImpl)

type GameContextProviderProps = {
  children?: React.ReactNode
}

export const GameContextProvider: React.FC<GameContextProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate()
  const [sceneId, setSceneId] = useSessionStorage<SceneId>('sceneId', 'world')
  const scene = useMemo(() => scenes[sceneId] as Scene, [sceneId])

  const navigateToScene = (sceneId: SceneId) => {
    setSceneId(sceneId)
    navigate({ to: '/game/scene' })
  }

  return (
    <GameContextImpl value={{ sceneId, scene, navigateToScene }}>
      {children}
    </GameContextImpl>
  )
}
