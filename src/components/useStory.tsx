import type { Character, Scene, ScriptAction, Story } from '@/types/Scene'
import { useEffect, useMemo, useState } from 'react'
import { useGameSave } from './useGameSave'

export const useStory = (scene: Scene) => {
  const { characters, stories } = scene as Scene
  const gameSave = useGameSave()
  const [loaded] = useState(true)

  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
    null,
  )
  const [currentDialogue, setCurrentDialogue] = useState<string | null>(null)
  const [scriptIndex, setScriptIndex] = useState<number>(-1)

  const hasStory = useMemo(() => currentStory !== null, [currentStory])

  useEffect(() => {
    if (currentStory === null) advanceStory()
  }, [currentStory])

  const getNextStory = () => {
    for (const story of stories) {
      const requirementsMet = gameSave.validateRequirements(story.requirements)
      if (requirementsMet && !gameSave.hasCompletedStory(story.name)) {
        return story
      }
    }
    return null
  }

  const processScriptAction = (scriptAction: ScriptAction) => {
    if ('character' in scriptAction) {
      console.log('characters', characters)
      const characterId = scriptAction.character
      const character = characters[characterId]
      if (character) {
        setCurrentCharacter(character)
        setCurrentDialogue(null)
        console.log(`Advancing story, character: ${character.name}`)
      } else {
        console.warn(`Character ${characterId} not found in scene`)
      }
    } else if ('dialogue' in scriptAction) {
      setCurrentDialogue(scriptAction.dialogue)
      console.log(`Advancing story, dialogue: ${scriptAction.dialogue}`)
    }
  }

  const advanceStory = () => {
    let story = currentStory
    let nextIndex = scriptIndex + 1
    if (story === null) {
      story = getNextStory()
      nextIndex = 0
      setCurrentStory(story)
    }
    if (!story) {
      console.log('No story available to advance')
      setCurrentCharacter(null)
      setCurrentDialogue(null)
    } else if (nextIndex >= story.script.length) {
      console.log('Story completed:', story.name)
      gameSave.completeStory(story.name)
      setCurrentStory(null)
      setCurrentCharacter(null)
      setCurrentDialogue(null)
      setScriptIndex(-1)
    } else {
      setScriptIndex(nextIndex)
      processScriptAction(story.script[nextIndex])
    }
  }

  return {
    loaded,
    hasStory,
    currentCharacter,
    currentDialogue,
    advanceStory,
  }
}
