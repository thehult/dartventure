import type { GameSnapshot } from '@thehult/dartgames-react'
import type { Outcome } from './Outcome'
import type { BotPlayer, DartPlayer } from './Player'

export type GameOptions = Record<string, unknown>

export type OpponentOptions = {
  name?: string
  /** Absolute three-dart average. Takes precedence over `relativeAverage`. */
  average?: number
  /** Average relative to the player's own average, e.g. `-20`. */
  relativeAverage?: number
  /** Lowest average the opponent plays at, whatever the player's average. */
  minAverage?: number
}

export type MatchOptions = {
  gameId: string
  gameOptions?: GameOptions
  opponent?: OpponentOptions
}

/** Who started a match, and so who decides what happens when it ends. */
export type MatchOrigin =
  | { type: 'action' }
  | {
      type: 'story'
      sceneId: string
      story: string
      /** Character on screen when the match started. */
      character: string | null
      /** Script positions to resume at. */
      onWin: number
      onLose: number
    }
  | { type: 'tournament'; bracketMatchId: number }

export type ActiveMatch = {
  id: string
  gameId: string
  gameOptions?: GameOptions
  players: [DartPlayer, BotPlayer]
  reward?: Outcome
  penalty?: Outcome
  origin: MatchOrigin
  /** Serialized game, saved after every turn. */
  gameData?: GameSnapshot
}

export type MatchResult = {
  won: boolean
  /** The player's three-dart average in the match, if measurable. */
  average?: number
}
