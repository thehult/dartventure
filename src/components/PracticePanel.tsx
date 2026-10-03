import { useState } from 'react'
import { Panel } from './Panel'
import type { GameState } from '@/types/GameState'
import { MAX_AVERAGE, MIN_AVERAGE } from '@/types/Player'
import { actions } from '@/state/actions'

const STARTING_SCORES = [301, 501] as const

type PracticePanelProps = { state: GameState; onClose: () => void }

export const PracticePanel: React.FC<PracticePanelProps> = ({
  state,
  onClose,
}) => {
  const [startingScore, setStartingScore] = useState<number>(301)
  const [average, setAverage] = useState(
    Math.round(
      Math.max(MIN_AVERAGE, Math.min(MAX_AVERAGE, state.playerAverage)),
    ),
  )
  return (
    <Panel title="Practice" onClose={onClose}>
      <p className="text-white/80 mb-3 short:mb-1 short:text-sm">
        A friendly game with nothing at stake: no fee, no reward, and it doesn't
        count towards your stats or average.
      </p>
      <fieldset className="mb-3 short:mb-1">
        <legend className="text-white/80 mb-1">Game</legend>
        <div className="grid grid-cols-2 gap-2">
          {STARTING_SCORES.map((score) => (
            <button
              key={score}
              type="button"
              aria-pressed={startingScore === score}
              className={`py-2 short:py-1 border-1 cursor-pointer transition ${
                startingScore === score
                  ? 'bg-(--primary-color) text-black border-(--primary-color)'
                  : 'border-white/50 hover:bg-white/10'
              }`}
              onClick={() => setStartingScore(score)}
            >
              {score} double out
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="block text-white/80 mb-1">
          Opponent average: <strong className="text-white">{average}</strong>
          {average === Math.round(state.playerAverage) && ' (your level)'}
        </span>
        <input
          type="range"
          className="w-full"
          min={MIN_AVERAGE}
          max={MAX_AVERAGE}
          value={average}
          onChange={(e) => setAverage(Number(e.target.value))}
        />
      </label>
      <button
        type="button"
        className="mt-4 short:mt-2 w-full py-3 short:py-1 bg-(--primary-color) text-black rounded-sm font-semibold hover:opacity-90 cursor-pointer transition"
        onClick={() =>
          actions.startPractice({
            gameId: 'x01',
            gameOptions: { startingScore, checkoutRule: 'double-out' },
            opponentAverage: average,
          })
        }
      >
        Play
      </button>
    </Panel>
  )
}
