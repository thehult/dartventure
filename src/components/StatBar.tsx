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
    <div className="w-full text-white flex justify-between items-center px-4 pt-2 pb-4 fixed top-0 left-0 z-50 text-base bg-linear-to-b from-black/70 to-transparent [text-shadow:0_1px_3px_black]">
      <div onClick={() => actions.give({ reputation: reputationHack })}>
        <strong>Reputation:</strong> {state.reputation}
      </div>
      <div onClick={() => actions.give({ money: moneyHack })}>
        <strong>Money:</strong> ${state.money}
      </div>
    </div>
  )
}

export default StatBar
