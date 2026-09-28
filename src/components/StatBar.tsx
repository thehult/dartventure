import React from 'react'
import type { GameState } from '@/types/GameState'
import type { Difficulty } from '@/engine/difficulty'
import { DIFFICULTIES, DIFFICULTY_ORDER } from '@/engine/difficulty'
import { actions } from '@/state/actions'

// Clicking the stats in development gives some for free, for testing.
const reputationHack = import.meta.env.DEV ? 5 : 0
const moneyHack = import.meta.env.DEV ? 100 : 0

type StatBarProps = {
  state: GameState
}

const StatBar: React.FC<StatBarProps> = ({ state }) => {
  return (
    <div className="w-full text-white flex justify-between items-center px-4 pt-2 pb-4 fixed top-0 left-0 z-50 text-base bg-linear-to-b from-black/70 to-transparent [text-shadow:0_1px_3px_black]">
      <div onClick={() => actions.give({ reputation: reputationHack })}>
        <strong>Reputation:</strong> {state.reputation}
      </div>
      <div className="flex items-center gap-3">
        <span>
          <strong>Average:</strong> {state.playerAverage.toFixed(1)}
        </span>
        <select
          aria-label="Difficulty"
          title={DIFFICULTIES[state.difficulty].description}
          className="bg-black/60 border-1 border-white/40 rounded px-1 text-sm cursor-pointer"
          value={state.difficulty}
          onChange={(e) =>
            actions.setDifficulty(e.target.value as Difficulty)
          }
        >
          {DIFFICULTY_ORDER.map((d) => (
            <option key={d} value={d}>
              {DIFFICULTIES[d].name}
            </option>
          ))}
        </select>
      </div>
      <div onClick={() => actions.give({ money: moneyHack })}>
        <strong>Money:</strong> ${state.money}
      </div>
    </div>
  )
}

export default StatBar
