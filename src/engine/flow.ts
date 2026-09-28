/**
 * The game's state machine. Every transition is a pure function from one
 * `GameState` to the next; `state/actions.ts` applies them to the store.
 * Which screen is shown follows from `state.activity`.
 */
import { evaluate } from './conditions'
import {
  applyOutcome,
  combineOutcomes,
  formatOutcome,
  scaleOutcome,
} from './outcome'
import { createActiveMatch, recordMatch } from './match'
import { advanceScript, runScript } from './story'
import { simulateMatch } from './simulate'
import { START_LOCATION } from './save'
import {
  createTournament,
  finalMatch,
  getPlayer,
  isFinished,
  nextPlayerMatch,
  playerStatus,
  playerWins,
  recordResult,
  simulateBotMatches,
} from './tournament'
import type { IGame, IGameData } from '@dartgames/core'
import type { GameState } from '@/types/GameState'
import type { TournamentActivity } from '@/types/Activity'
import type { Action } from '@/types/Scene'
import type { ActiveMatch, MatchResult } from '@/types/Match'
import type { BotPlayer } from '@/types/Player'
import { PLAYER_ID } from '@/types/Player'
import { games } from '@/games/registry'
import { findStory, getScene, scenes } from '@/scenes'

/** Guards against stories that finish without any input and re-trigger. */
const MAX_AUTO_STORIES = 20

/**
 * Starts the first story in the current scene that hasn't been completed and
 * whose `when` holds. Called after every transition that frees the player.
 */
export const settle = (state: GameState): GameState => {
  for (let i = 0; i < MAX_AUTO_STORIES && state.activity === null; i++) {
    const story = getScene(state.location).stories.find(
      (s) => !state.completedStories.includes(s.name) && evaluate(s.when, state),
    )
    if (!story) break
    state = runScript(state, state.location, story, 0)
  }
  return state
}

/**
 * Makes a loaded save consistent with the current content, e.g. when a scene
 * or story it refers to has been renamed.
 */
export const repair = (state: GameState): GameState => {
  if (!scenes[state.location]) state = { ...state, location: START_LOCATION }
  const activity = state.activity
  const valid =
    activity === null ||
    (activity.type === 'story' &&
      findStory(activity.sceneId, activity.story) !== undefined) ||
    (activity.type === 'match' && activity.match.gameId in games) ||
    (activity.type === 'tournament' && activity.tournament.gameId in games)
  if (!valid) {
    console.warn('Dropping activity that no longer matches content', activity)
    state = { ...state, activity: null }
  }
  return settle(state)
}

export const isActionVisible = (action: Action, state: GameState) =>
  evaluate(action.visible, state)

export const entryFee = (action: Action) =>
  action.action === 'navigate' ? 0 : (action.entryFee ?? 0)

export const canAfford = (action: Action, state: GameState) =>
  state.money >= entryFee(action)

export const isActionEnabled = (action: Action, state: GameState) =>
  evaluate(action.enabled, state) && canAfford(action, state)

export const performAction = (state: GameState, action: Action): GameState => {
  if (state.activity !== null) return state
  if (!isActionVisible(action, state) || !isActionEnabled(action, state)) {
    return state
  }

  state = { ...state, money: state.money - entryFee(action) }
  switch (action.action) {
    case 'navigate':
      return settle({ ...state, location: action.sceneId })
    case 'match':
      return {
        ...state,
        activity: {
          type: 'match',
          match: createActiveMatch(
            state,
            action.options,
            { type: 'action' },
            action,
          ),
        },
      }
    case 'tournament': {
      const tournament = createTournament(
        action.options,
        { id: PLAYER_ID, name: state.playerName },
        state.playerAverage,
        state.difficulty,
      )
      return {
        ...state,
        stats: {
          ...state.stats,
          tournamentsPlayed: state.stats.tournamentsPlayed + 1,
        },
        activity: {
          type: 'tournament',
          tournament: simulateBotMatches(tournament, simulateMatch),
          roundReward: action.roundReward,
          reward: action.reward,
          penalty: action.penalty,
        },
      }
    }
  }
}

export const advanceStory = (state: GameState, choice?: number): GameState => {
  const activity = state.activity
  if (activity?.type !== 'story') return state
  const story = findStory(activity.sceneId, activity.story)
  if (!story) return settle({ ...state, activity: null })
  return settle(advanceScript(state, story, choice))
}

/** The match being played, if any. */
export const activeMatch = (state: GameState): ActiveMatch | undefined => {
  const activity = state.activity
  if (activity?.type === 'match') return activity.match
  if (activity?.type === 'tournament') return activity.match
  return undefined
}

export const saveMatchProgress = (
  state: GameState,
  matchId: string,
  gameData: IGameData<IGame>,
): GameState => {
  const activity = state.activity
  if (activeMatch(state)?.id !== matchId || !activity) return state
  if (activity.type === 'match') {
    return {
      ...state,
      activity: { ...activity, match: { ...activity.match, gameData } },
    }
  }
  if (activity.type === 'tournament' && activity.match) {
    return {
      ...state,
      activity: { ...activity, match: { ...activity.match, gameData } },
    }
  }
  return state
}

export const startTournamentMatch = (state: GameState): GameState => {
  const activity = state.activity
  if (activity?.type !== 'tournament' || activity.match) return state
  const { tournament } = activity
  const bracketMatch = nextPlayerMatch(tournament)
  if (!bracketMatch) return state
  const opponentId =
    bracketMatch.player1 === PLAYER_ID
      ? bracketMatch.player2!
      : bracketMatch.player1!
  const match = createActiveMatch(
    state,
    { gameId: tournament.gameId, gameOptions: tournament.gameOptions },
    { type: 'tournament', bracketMatchId: bracketMatch.id },
    {},
    getPlayer(tournament, opponentId) as BotPlayer,
  )
  return { ...state, activity: { ...activity, match } }
}

/** Text shown when a match ends, before the player continues. */
export const describeMatchResult = (
  state: GameState,
  won: boolean,
): { title: string; text: string } => {
  const title = won ? 'You won!' : 'You lost!'
  const activity = state.activity
  if (activity?.type === 'tournament' && activity.match) {
    const origin = activity.match.origin
    const isFinal =
      origin.type === 'tournament' &&
      origin.bracketMatchId === finalMatch(activity.tournament).id
    if (won && isFinal) return { title, text: 'You won the tournament!' }
    return {
      title,
      text: won
        ? 'You advance to the next round.'
        : 'You are out of the tournament.',
    }
  }
  const match = activeMatch(state)
  return { title, text: formatOutcome(won ? match?.reward : match?.penalty) }
}

/** Ends the current match and hands control back to whoever started it. */
export const resolveMatch = (
  state: GameState,
  result: MatchResult,
): GameState => {
  const match = activeMatch(state)
  const activity = state.activity
  if (!match || !activity) return state
  state = recordMatch(state, result)
  const origin = match.origin

  if (activity.type === 'tournament' && origin.type === 'tournament') {
    const winner = result.won ? PLAYER_ID : match.players[1].id
    const tournament = simulateBotMatches(
      recordResult(activity.tournament, origin.bracketMatchId, winner),
      simulateMatch,
    )
    return {
      ...state,
      activity: { ...activity, tournament, match: undefined },
    }
  }

  state = applyOutcome(state, result.won ? match.reward : match.penalty)
  if (origin.type === 'story') {
    const story = findStory(origin.sceneId, origin.story)
    if (story) {
      const pc = result.won ? origin.onWin : origin.onLose
      return settle(
        runScript(
          { ...state, activity: null },
          origin.sceneId,
          story,
          pc,
          origin.character,
        ),
      )
    }
  }
  return settle({ ...state, activity: null })
}

/** What the player gets for their tournament run if they leave now. */
const tournamentOutcome = (activity: TournamentActivity) => {
  const champion = playerStatus(activity.tournament) === 'champion'
  return combineOutcomes(
    scaleOutcome(activity.roundReward, playerWins(activity.tournament)),
    champion ? activity.reward : activity.penalty,
  )
}

/**
 * Leaves the tournament. The player gets the round reward for every match
 * they won, plus the reward for winning it or the penalty for being
 * eliminated or withdrawing early.
 */
export const leaveTournament = (state: GameState): GameState => {
  const activity = state.activity
  if (activity?.type !== 'tournament' || activity.match) return state
  const champion = playerStatus(activity.tournament) === 'champion'
  state = applyOutcome(state, tournamentOutcome(activity))
  if (champion) {
    state = {
      ...state,
      stats: { ...state.stats, tournamentsWon: state.stats.tournamentsWon + 1 },
    }
  }
  return settle({ ...state, activity: null })
}

export const tournamentSummary = (state: GameState) => {
  const activity = state.activity
  if (activity?.type !== 'tournament') return undefined
  const { tournament } = activity
  const status = playerStatus(tournament)
  const finished = isFinished(tournament)
  const champion = finished
    ? getPlayer(tournament, finalMatch(tournament).winner!)
    : undefined
  const next = nextPlayerMatch(tournament)
  const opponentId = next
    ? next.player1 === PLAYER_ID
      ? next.player2
      : next.player1
    : undefined
  return {
    status,
    finished,
    champion,
    nextOpponent: opponentId ? getPlayer(tournament, opponentId) : undefined,
    outcome: tournamentOutcome(activity),
  }
}
