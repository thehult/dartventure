import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Background } from '@/components/Background'
import { Menu, MenuButton, MenuImage } from '@/components/Menu'
import { createSave, listSaves, openSave } from '@/state/store'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const navigate = useNavigate()
  const [saves] = useState(listSaves)
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')

  const handleContinueGame = () => {
    if (openSave(saves[0].id)) navigate({ to: '/game' })
  }

  const handleStartGame = (event: React.FormEvent) => {
    event.preventDefault()
    createSave(name.trim() || 'Player')
    navigate({ to: '/game' })
  }

  return (
    <Background background="/game_assets/scenes/pub/background.png">
      <Menu>
        <MenuImage image="/logo512.png" />
        {naming ? (
          <form
            className="flex flex-col items-center gap-4 w-full"
            onSubmit={handleStartGame}
          >
            <input
              autoFocus
              className="w-full md:w-1/2 lg:w-1/4 py-4 px-4 bg-black/70 text-white text-xl border-1 border-white"
              placeholder="Your name"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <MenuButton type="submit">Start</MenuButton>
            <MenuButton onClick={() => setNaming(false)}>Back</MenuButton>
          </form>
        ) : (
          <>
            <MenuButton
              visible={saves.length > 0}
              onClick={handleContinueGame}
            >
              Continue as {saves[0]?.name}
            </MenuButton>
            <MenuButton onClick={() => setNaming(true)}>New Game</MenuButton>
          </>
        )}
      </Menu>
    </Background>
  )
}
