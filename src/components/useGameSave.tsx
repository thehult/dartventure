import type { GameSave } from '@/types/GameSave'
import type { Requirement } from '@/types/Scene'
import { useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export const useGameSave = (saveName: string = 'gameSave') => {
  const [gameSave, setGameSave] = useLocalStorage<GameSave>(saveName, {
    // const [gameSave, setGameSave] = useState<GameSave>({
    money: 0,
    reputation: 0,
    completedStories: [],
  })
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
    money: gameSave.money,
    reputation: gameSave.reputation,
    completedStories: gameSave.completedStories,
    addMoney,
    addReputation,
    completeStory,
    hasCompletedStory,
    validateRequirements,
  }
}
