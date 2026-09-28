import type { BotPlayer } from '@/types/Player'
import type {
  ActiveMatch,
  MatchOptions,
  MatchOrigin,
  MatchResult,
} from '@/types/Match'
import type { GameState } from '@/types/GameState'
import type { Outcome } from '@/types/Outcome'
import { getGame } from '@/games/registry'
import { PLAYER_ID, clampAverage } from '@/types/Player'
import { randomMaleName } from '@/util/names'

export const OPPONENT_ID = 'opponent'

/** How much a single match moves the player's average. */
const AVERAGE_WEIGHT = 0.2

/**
 * Resolves a bot's average: an absolute `average` wins, otherwise it is the
 * player's average plus `relativeAverage`.
 */
export const resolveAverage = (
  options: { average?: number; relativeAverage?: number },
  playerAverage: number,
): number =>
  clampAverage(options.average ?? playerAverage + (options.relativeAverage ?? 0))

const createMatchId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const createActiveMatch = (
  state: GameState,
  options: MatchOptions,
  origin: MatchOrigin,
  outcomes: { reward?: Outcome; penalty?: Outcome } = {},
  opponent?: BotPlayer,
): ActiveMatch => {
  getGame(options.gameId) // Fail early on unknown games
  return {
    id: createMatchId(),
    gameId: options.gameId,
    gameOptions: options.gameOptions,
    players: [
      { id: PLAYER_ID, name: state.playerName },
      opponent ?? {
        id: OPPONENT_ID,
        name: options.opponent?.name ?? randomMaleName(),
        average: resolveAverage(options.opponent ?? {}, state.playerAverage),
      },
    ],
    reward: outcomes.reward,
    penalty: outcomes.penalty,
    origin,
  }
}

/** Updates stats and the player's average after a match. */
export const recordMatch = (
  state: GameState,
  result: MatchResult,
): GameState => ({
  ...state,
  playerAverage:
    result.average === undefined
      ? state.playerAverage
      : Math.round(
          (state.playerAverage * (1 - AVERAGE_WEIGHT) +
            result.average * AVERAGE_WEIGHT) *
            10,
        ) / 10,
  stats: {
    ...state.stats,
    matchesPlayed: state.stats.matchesPlayed + 1,
    matchesWon: state.stats.matchesWon + (result.won ? 1 : 0),
  },
})
