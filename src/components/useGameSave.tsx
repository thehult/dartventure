import {
  migrateGameSave,
  type GameSave,
  type GameSaveVersions,
} from '@/types/GameSave'
import type { Requirement } from '@/types/Scene'
import { useEffect } from 'react'
import { useLocalStorage } from 'usehooks-ts'

const defaultGameSave: GameSaveVersions = {
  // const [gameSave, setGameSave] = useState<GameSave>({
  version: 1,
  money: 0,
  reputation: 0,
  completedStories: [],
}

export const useGameSave = (saveName: string = 'gameSave') => {
  const [gameSave, setGameSave] = useLocalStorage<GameSaveVersions>(
    saveName,
    defaultGameSave,
  )
  const [_, setBackup] = useLocalStorage<GameSaveVersions | undefined>(
    `${saveName}_backup`,
    undefined,
  )
  useEffect(() => {
    const migratedGameSave = migrateGameSave(gameSave)
    if (migratedGameSave.version !== gameSave.version) {
      setBackup(gameSave)
      setGameSave(migratedGameSave)
    }
  }, [gameSave])

  const addMoney = (amount: number) => {
    setGameSave((prev) => ({
      ...prev,
      money: prev.money + amount,
    }))
  }
  const addReputation = (amount: number) => {
    setGameSave((prev) => ({
      ...prev,
      reputation: prev.reputation + amount,
    }))
  }
  const completeStory = (storyName: string) => {
    setGameSave((prev) => ({
      ...prev,
      completedStories: [...prev.completedStories, storyName],
    }))
  }
  const hasCompletedStory = (storyName: string) => {
    return gameSave.completedStories.includes(storyName)
  }

  const validateRequirements = (requirements?: Requirement[]): boolean => {
    if (!requirements || requirements.length === 0) {
      return true
    }
    return requirements.every((req) => {
      if ('reputation' in req) {
        return gameSave.reputation >= req.reputation
      } else if ('story' in req) {
        return hasCompletedStory(req.story)
      }
      return false
    })
  }

  return {
    ...(gameSave as GameSave),
    addMoney,
    addReputation,
    completeStory,
    hasCompletedStory,
    validateRequirements,
  }
}
