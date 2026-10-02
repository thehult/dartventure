import type { GameOptions } from './Match'
import type { BotPlayer, DartPlayer } from './Player'

export type BracketSlot = 'player1' | 'player2'

export type BracketMatch = {
  id: number
  /** 1 is the first round, `Tournament.rounds` is the final. */
  round: number
  player1?: string
  player2?: string
  winner?: string
  /** Where the winner goes. Undefined for the final. */
  next?: { matchId: number; slot: BracketSlot }
}

export type Tournament = {
  name: string
  gameId: string
  gameOptions?: GameOptions
  players: Array<DartPlayer | BotPlayer>
  rounds: number
  matches: Array<BracketMatch>
}

export type TournamentOptions = {
  name?: string
  /** Number of participants, including the player. Must be a power of two. */
  players: number
  gameId: string
  gameOptions?: GameOptions
  /** Absolute base average of the bots. Takes precedence over `relativeAverage`. */
  average?: number
  /** Base average of the bots relative to the player's average. */
  relativeAverage?: number
  /** Lowest base average of the bots, whatever the player's average. */
  minAverage?: number
  /** Each bot's average is randomized within ± this value. Defaults to 5. */
  spread?: number
}

export type TournamentStatus = 'playing' | 'eliminated' | 'champion'

