import { useLocalStorage } from 'usehooks-ts'
import { useCurrentGameSave } from './useGameSave'
import { useNavigate } from '@tanstack/react-router'

type GameSave = {
  id: string
  name: string
  createdAt: number
  latestLoad: number
}

export const useGameSaves = () => {
  const navigate = useNavigate()
  const { setCurrentGameSave } = useCurrentGameSave()
  const [gameSaves, setGameSaves] = useLocalStorage<GameSave[]>('gamesaves', [])

  const compareFn = (a: GameSave, b: GameSave) => a.latestLoad - b.latestLoad

  const createGameSave = (name: string) => {
    const id = Date.now().toString(16)
    setGameSaves((gs) =>
      [
        ...gs,
        {
          id,
          name,
          createdAt: Date.now(),
          latestLoad: Date.now(),
        },
      ].sort(compareFn),
    )
    setCurrentGameSave(id)
    navigate({ to: '/game' })
  }

  const loadGameSave = (id: string) => {
    if (!gameSaves.some((s) => s.id === id)) return

    setGameSaves((gs) => {
      return gs
        .map((s) => {
          if (s.id !== id) return s
          return {
            ...s,
            latestLoad: Date.now(),
          }
        })
        .sort(compareFn)
    })
    setCurrentGameSave(id)
    navigate({ to: '/game' })
  }

  return {
    gameSaves,
    createGameSave,
    loadGameSave,
  }
}
