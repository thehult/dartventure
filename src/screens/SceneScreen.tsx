import { useEffect, useState } from 'react'
import type { GameState } from '@/types/GameState'
import { Background } from '@/components/Background'
import { Character } from '@/components/Character'
import { Dialogue } from '@/components/Dialogue'
import { ActionMap } from '@/components/ActionMap'
import StatBar from '@/components/StatBar'
import { findStory, getScene } from '@/scenes'
import { availableChoices } from '@/engine/story'
import { actions } from '@/state/actions'

/** Wait at most this long for a character to walk in before talking. */
const ENTER_TIMEOUT = 1500

export function SceneScreen({ state }: { state: GameState }) {
  const scene = getScene(state.location)
  const activity = state.activity?.type === 'story' ? state.activity : null
  const characterId = activity?.character ?? null
  const character = characterId ? scene.characters[characterId] : undefined

  // Dialogue waits until the speaking character has walked in.
  const [entered, setEntered] = useState<string | null>(null)
  const ready = characterId === null || entered === characterId
  useEffect(() => {
    if (characterId === null) return
    const timeout = setTimeout(() => setEntered(characterId), ENTER_TIMEOUT)
    return () => clearTimeout(timeout)
  }, [characterId])

  const step = activity
    ? findStory(activity.sceneId, activity.story)?.script[activity.pc]
    : undefined
  const choices =
    step && 'choice' in step ? availableChoices(step, state) : undefined
  const text =
    step && 'dialogue' in step ? step.dialogue : choices ? '' : undefined

  return (
    <Background background={scene.background}>
      <StatBar state={state} />
      {Object.entries(scene.characters).map(([id, c]) => (
        <Character
          key={id}
          image={c.image}
          visible={characterId === id}
          onEntered={() => setEntered(id)}
        />
      ))}
      {activity && ready && text !== undefined && (
        <Dialogue
          speaker={character?.name}
          visible={true}
          choices={choices?.map((c) => c.text)}
          onChoice={(i) => actions.advanceStory(i)}
          onContinue={() => actions.advanceStory()}
        >
          {text}
        </Dialogue>
      )}
      {!activity && (
        <ActionMap sceneActions={scene.actions} state={state} />
      )}
    </Background>
  )
}
