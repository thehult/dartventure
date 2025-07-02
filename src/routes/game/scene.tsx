import { Background } from '@/components/Background'
import { createFileRoute } from '@tanstack/react-router'
import { Character } from '@/components/Character'
import { Dialogue } from '@/components/Dialogue'

import PubScene from '@/scenes/pub.yml'
import { useScene } from '@/components/useScene'
import { useClickAnyWhere } from 'usehooks-ts'
import { Map } from '@/components/Map'
import StatBar from '@/components/StatBar'

export const Route = createFileRoute('/game/scene')({
  component: SceneComponent,
})

function SceneComponent() {
  console.log(PubScene)
  const {
    loaded,
    background,
    characters,
    actions,
    hasStory,
    currentCharacter,
    currentDialogue,
    advanceStory,
  } = useScene(PubScene)

  useClickAnyWhere(() => {
    console.log('Clicked anywhere, advancing story')
    advanceStory()
  })

  const characterEntered = () => {
    advanceStory()
  }

  if (!loaded) {
    return <div>Loading...</div>
  }

  return (
    <Background background={background}>
      <StatBar />
      {Object.values(characters).map((character) => (
        <Character
          key={character.name}
          image={character.image}
          visible={currentCharacter?.name === character.name}
          onEntered={characterEntered}
        />
      ))}
      {/* {currentCharacter !== null && (
        <Character
          key={currentCharacter.name}
          image={currentCharacter.image}
          onEntered={characterEntered}
        />
      )} */}
      {currentDialogue !== null && (
        <Dialogue speaker={currentCharacter?.name} visible={true}>
          {currentDialogue}
        </Dialogue>
      )}
      {!hasStory && <Map actions={actions} />}

      {/* <Menu>
        <MenuItem>Test 1</MenuItem>
        <MenuItem>Test 2</MenuItem>
      </Menu> */}
    </Background>
  )
}
