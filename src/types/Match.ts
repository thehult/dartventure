import type { GameId, Outcome } from './Actions'
import type { DartPlayer, Opponent } from './Player'

export type MatchOptions = {
  opponent?: Opponent
  average?: number
  gameId: GameId
  gameOptions?: { [key: string]: any }
  reward?: Outcome
  penalty?: Outcome
}

export type Match = {
  gameId: GameId
  players: DartPlayer[]
  gameOptions?: { [key: string]: any }
  gameState?: any
  reward?: Outcome
  penalty?: Outcome
}
