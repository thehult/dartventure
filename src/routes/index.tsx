import { createFileRoute } from '@tanstack/react-router'
import { Background } from '@/components/Background'
import { useGameSaves } from '@/hooks/useGameSaves'
import { Menu, MenuButton, MenuImage } from '@/components/Menu'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { gameSaves, createGameSave, loadGameSave } = useGameSaves()

  const handleNewGame = () => {
    createGameSave('test123')
  }

  const handleContinueGame = () => {
    loadGameSave(gameSaves[0].id)
  }

  return (
    <Background background="/game_assets/scenes/pub/background.png">
      <Menu>
        <MenuImage image="/logo512.png" />
        <MenuButton visible={gameSaves.length > 0} onClick={handleContinueGame}>
          Continue Game
        </MenuButton>
        <MenuButton onClick={handleNewGame}>New Game</MenuButton>
      </Menu>
    </Background>
  )
}
