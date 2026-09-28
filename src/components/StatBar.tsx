import React from 'react'
import type { GameState } from '@/types/GameState'
import { actions } from '@/state/actions'

// Clicking the stats in development gives some for free, for testing.
const reputationHack = import.meta.env.DEV ? 5 : 0
const moneyHack = import.meta.env.DEV ? 100 : 0

type StatBarProps = {
  state: GameState
}

const StatBar: React.FC<StatBarProps> = ({ state }) => {
  return (
    <div className="w-full text-white flex justify-between items-center px-4 py-2 fixed top-0 left-0 z-50 text-base">
      <div onClick={() => actions.give({ reputation: reputationHack })}>
        <strong>Reputation:</strong> {state.reputation}
      </div>
      <div>
        <strong>Average:</strong> {state.playerAverage.toFixed(1)}
      </div>
      <div onClick={() => actions.give({ money: moneyHack })}>
        <strong>Money:</strong> ${state.money}
      </div>
    </div>
  )
}

export default StatBar
