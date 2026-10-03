import { Panel } from './Panel'
import type { GameState } from '@/types/GameState'
import { DIFFICULTIES } from '@/engine/difficulty'

const percent = (part: number, total: number) =>
  total === 0 ? '–' : `${Math.round((part / total) * 100)}%`

export const StatsPanel: React.FC<{
  state: GameState
  onClose: () => void
}> = ({ state, onClose }) => {
  const { stats } = state
  const rows: Array<[string, string | number]> = [
    ['Player', state.playerName],
    ['Difficulty', DIFFICULTIES[state.difficulty].name],
    ['Reputation', state.reputation],
    ['Money', `$${state.money}`],
    ['Three-dart average', state.playerAverage.toFixed(1)],
    ['Matches played', stats.matchesPlayed],
    ['Matches won', stats.matchesWon],
    ['Win rate', percent(stats.matchesWon, stats.matchesPlayed)],
    ['Tournaments entered', stats.tournamentsPlayed],
    ['Tournaments won', stats.tournamentsWon],
  ]
  return (
    <Panel title="Stats" onClose={onClose}>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 short:text-sm tabular-nums">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-white/80">{label}</dt>
            <dd className="font-semibold text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
