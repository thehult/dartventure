import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Difficulty } from '@/engine/difficulty'
import { Background } from '@/components/Background'
import { DifficultyPicker } from '@/components/DifficultyPicker'
import { Menu, MenuButton, MenuImage } from '@/components/Menu'
import { DEFAULT_DIFFICULTY } from '@/engine/difficulty'
import { createSave, listSaves, openSave } from '@/state/store'

export const Route = createFileRoute('/')({
  component: App,
})

const panelClass =
  'w-full md:w-1/2 lg:w-1/3 bg-black/70 text-white border-1 border-white'

function App() {
  const navigate = useNavigate()
  const [saves] = useState(listSaves)
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY)

  const handleContinueGame = () => {
    if (openSave(saves[0].id)) navigate({ to: '/game' })
  }

  const handleStartGame = (event: React.FormEvent) => {
    event.preventDefault()
    createSave(name.trim() || 'Player', { difficulty })
    navigate({ to: '/game' })
  }

  return (
    <Background background="/game_assets/scenes/pub/background.png">
      <Menu>
        <MenuImage image="/logo512.png" small={naming} />
        {naming ? (
          <form
            className="flex flex-col items-center gap-4 short:gap-2 w-full"
            onSubmit={handleStartGame}
          >
            <input
              autoFocus
              className={`${panelClass} py-4 short:py-2 px-4 text-xl`}
              placeholder="Your name"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <fieldset className={`${panelClass} py-3 short:py-1 px-4`}>
              <legend className="px-1">Difficulty</legend>
              <DifficultyPicker value={difficulty} onChange={setDifficulty} />
            </fieldset>
            <MenuButton type="submit">Start</MenuButton>
            <MenuButton onClick={() => setNaming(false)}>Back</MenuButton>
          </form>
        ) : (
          <>
            <MenuButton visible={saves.length > 0} onClick={handleContinueGame}>
              Continue as {saves[0]?.name}
            </MenuButton>
            <MenuButton onClick={() => setNaming(true)}>New Game</MenuButton>
          </>
        )}
      </Menu>
    </Background>
  )
}
