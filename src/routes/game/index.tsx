import { Background } from '@/components/Background'
import { createFileRoute } from '@tanstack/react-router'
import { Character } from '@/components/Character'
import { Dialogue } from '@/components/Dialogue'

import { useStory } from '@/hooks/useStory'
import { useClickAnyWhere } from 'usehooks-ts'
import { ActionMap } from '@/components/ActionMap'
import StatBar from '@/components/StatBar'
import type { SceneId } from '@/scenes/scenes'
import { useScene } from '@/hooks/useScene'

export type SceneSearchParams = {
  sceneId: SceneId
}

export const Route = createFileRoute('/game/')({
  component: SceneComponent,
})

function SceneComponent() {
  const { scene } = useScene()
  const { loaded, hasStory, currentCharacter, currentDialogue, advanceStory } =
    useStory(scene)

  useClickAnyWhere(() => {
    advanceStory()
  })

  const characterEntered = () => {
    advanceStory()
  }

  if (!loaded) {
    return <div>Loading...</div>
  }

  return (
    <Background background={scene.background}>
      <StatBar />
      {Object.values(scene.characters).map((character) => (
        <Character
          key={character.name}
          image={character.image}
          visible={currentCharacter?.name === character.name}
          onEntered={characterEntered}
        />
      ))}
      {currentDialogue !== null && (
        <Dialogue speaker={currentCharacter?.name} visible={true}>
          {currentDialogue}
        </Dialogue>
      )}
      {!hasStory && <ActionMap actions={scene.actions} />}
    </Background>
  )
}
