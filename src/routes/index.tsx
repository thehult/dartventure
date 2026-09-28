import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Difficulty } from '@/engine/difficulty'
import { Background } from '@/components/Background'
import { Menu, MenuButton, MenuImage } from '@/components/Menu'
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  DIFFICULTY_ORDER,
} from '@/engine/difficulty'
import { DEFAULT_PLAYER_AVERAGE } from '@/engine/save'
import { createSave, listSaves, openSave } from '@/state/store'
import { MAX_AVERAGE, MIN_AVERAGE, clampAverage } from '@/types/Player'

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
  const [average, setAverage] = useState(String(DEFAULT_PLAYER_AVERAGE))
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY)

  const handleContinueGame = () => {
    if (openSave(saves[0].id)) navigate({ to: '/game' })
  }

  const handleStartGame = (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = Number(average)
    createSave(name.trim() || 'Player', {
      difficulty,
      playerAverage: Number.isFinite(parsed)
        ? clampAverage(parsed)
        : DEFAULT_PLAYER_AVERAGE,
    })
    navigate({ to: '/game' })
  }

  return (
    <Background background="/game_assets/scenes/pub/background.png">
      <Menu>
        <MenuImage image="/logo512.png" small={naming} />
        {naming ? (
          <form
            className="flex flex-col items-center gap-4 w-full"
            onSubmit={handleStartGame}
          >
            <input
              autoFocus
              className={`${panelClass} py-4 px-4 text-xl`}
              placeholder="Your name"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className={`${panelClass} flex items-center gap-4 py-3 px-4`}>
              <span className="flex-grow">
                Your three-dart average, roughly
                <span className="block text-sm text-white/70">
                  Opponents are matched to it. It updates as you play.
                </span>
              </span>
              <input
                type="number"
                min={MIN_AVERAGE}
                max={MAX_AVERAGE}
                className="w-20 py-2 px-2 bg-black/70 text-xl text-right border-1 border-white/50"
                value={average}
                onChange={(e) => setAverage(e.target.value)}
              />
            </label>
            <fieldset className={`${panelClass} py-3 px-4`}>
              <legend className="px-1">Difficulty</legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DIFFICULTY_ORDER.map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={difficulty === d}
                    className={`py-2 border-1 cursor-pointer transition ${
                      difficulty === d
                        ? 'bg-(--primary-color) text-black border-(--primary-color)'
                        : 'border-white/50 hover:bg-white/10'
                    }`}
                    onClick={() => setDifficulty(d)}
                  >
                    {DIFFICULTIES[d].name}
                  </button>
                ))}
              </div>
              <p className="text-sm text-white/80 mt-2 min-h-10">
                {DIFFICULTIES[difficulty].description}
              </p>
            </fieldset>
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
