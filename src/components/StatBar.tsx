import React from 'react'
import type { GameState } from '@/types/GameState'
import { actions } from '@/state/actions'

// Clicking the stats in development gives some for free, for testing.
const reputationHack = import.meta.env.DEV ? 5 : 0
const moneyHack = import.meta.env.DEV ? 100 : 0

const iconProps = {
  viewBox: '0 0 24 24',
  className: 'w-6 h-6 short:w-5 short:h-5 shrink-0',
  'aria-hidden': true,
} as const

const StarIcon = () => (
  <svg {...iconProps}>
    <path
      d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
      fill="#ffca28"
      stroke="#b28704"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

const CoinIcon = () => (
  <svg {...iconProps}>
    <circle
      cx="12"
      cy="12"
      r="9.5"
      fill="#ffca28"
      stroke="#b28704"
      strokeWidth="1.5"
    />
    <circle
      cx="12"
      cy="12"
      r="6.5"
      fill="none"
      stroke="#b28704"
      strokeWidth="1"
    />
    <path
      d="M12 7v10M14.5 9.5c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.4.7-2.4 1.8 0 2.4 5 1.2 5 3.7 0 1.1-1.1 1.9-2.6 1.9-1.1 0-2.1-.5-2.6-1.3"
      fill="none"
      stroke="#7a5b00"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
)

type StatProps = {
  icon: React.ReactNode
  label: string
  value: string | number
  onClick: () => void
}

const Stat: React.FC<StatProps> = ({ icon, label, value, onClick }) => (
  <button
    type="button"
    title={label}
    aria-label={`${label}: ${value}`}
    onClick={onClick}
    className="flex items-center gap-2 pl-2 pr-4 py-1 short:py-0.5 rounded-full bg-black/55 border border-white/20 backdrop-blur-sm shadow-md text-white text-lg short:text-base font-semibold tabular-nums cursor-default"
  >
    {icon}
    <span>{value}</span>
  </button>
)

type StatBarProps = {
  state: GameState
}

const StatBar: React.FC<StatBarProps> = ({ state }) => {
  return (
    <div className="w-full flex justify-between items-center gap-2 px-3 pt-2 pb-6 fixed top-0 left-0 z-50 pointer-events-none bg-linear-to-b from-black/60 to-transparent [text-shadow:0_1px_3px_black] *:pointer-events-auto">
      <Stat
        icon={<StarIcon />}
        label="Reputation"
        value={state.reputation}
        onClick={() => actions.give({ reputation: reputationHack })}
      />
      <Stat
        icon={<CoinIcon />}
        label="Money"
        value={`$${state.money}`}
        onClick={() => actions.give({ money: moneyHack })}
      />
    </div>
  )
}

export default StatBar
