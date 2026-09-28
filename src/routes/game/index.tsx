import { createFileRoute, redirect } from '@tanstack/react-router'
import { restoreSession, useGameState } from '@/state/store'
import { SceneScreen } from '@/screens/SceneScreen'
import { MatchScreen } from '@/screens/MatchScreen'
import { TournamentScreen } from '@/screens/TournamentScreen'

export const Route = createFileRoute('/game/')({
  beforeLoad: () => {
    if (!restoreSession()) throw redirect({ to: '/' })
  },
  component: GameScreen,
})

/** Shows whatever the player is doing, as decided by `state.activity`. */
function GameScreen() {
  const state = useGameState()
  const activity = state.activity

  if (activity?.type === 'match') {
    return (
      <MatchScreen key={activity.match.id} state={state} match={activity.match} />
    )
  }
  if (activity?.type === 'tournament') {
    if (activity.match) {
      return (
        <MatchScreen
          key={activity.match.id}
          state={state}
          match={activity.match}
        />
      )
    }
    return <TournamentScreen state={state} activity={activity} />
  }
  return <SceneScreen state={state} />
}
