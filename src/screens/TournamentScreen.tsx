import Markdown from 'react-markdown'
import type { TournamentActivity } from '@/types/Activity'
import type { GameState } from '@/types/GameState'
import { Background } from '@/components/Background'
import StatBar from '@/components/StatBar'
import { TournamentTree } from '@/components/TournamentTree'
import { formatOutcome } from '@/engine/outcome'
import { tournamentSummary } from '@/engine/flow'
import { getScene } from '@/scenes'
import { actions } from '@/state/actions'

const buttonClass =
  'px-6 py-3 bg-(--alternative-color) hover:bg-(--secondary-color) cursor-pointer transition'

/** The bracket, between the player's tournament matches. */
export function TournamentScreen({
  state,
  activity,
}: {
  state: GameState
  activity: TournamentActivity
}) {
  const summary = tournamentSummary(state)!

  const withdraw = () => {
    if (window.confirm('Withdraw from the tournament?')) {
      actions.leaveTournament()
    }
  }

  return (
    <Background background={getScene(state.location).background}>
      <StatBar state={state} />
      <div className="flex w-full h-full p-2 sm:p-4 pt-12 sm:pt-12 overflow-y-auto text-neutral-50 font-[Kalam]">
        <div className="m-auto flex flex-col items-center gap-3 sm:gap-4 w-full md:w-auto max-w-full p-3 sm:p-4 bg-neutral-950 border-double border-white border-1">
          <h1 className="text-2xl short:text-xl">{activity.tournament.name}</h1>
          {summary.status === 'playing' && summary.nextOpponent && (
            <>
              <p>Next up: {summary.nextOpponent.name}</p>
              <div className="flex gap-4 flex-wrap justify-center">
                <button className={buttonClass} onClick={withdraw}>
                  Withdraw
                </button>
                <button
                  className={buttonClass}
                  onClick={() => actions.startTournamentMatch()}
                >
                  Play match
                </button>
              </div>
            </>
          )}

          {summary.status !== 'playing' && (
            <>
              <p>
                {summary.status === 'champion'
                  ? 'You are the champion!'
                  : `You were knocked out. ${summary.champion?.name ?? 'Someone'} won the tournament.`}
              </p>
              <Markdown>{formatOutcome(summary.outcome)}</Markdown>
              <button
                className={buttonClass}
                onClick={() => actions.leaveTournament()}
              >
                Leave
              </button>
            </>
          )}

          {/* Below the actions, so they stay in reach when a big bracket
              doesn't fit on a phone. */}
          <TournamentTree tournament={activity.tournament} />
        </div>
      </div>
    </Background>
  )
}
