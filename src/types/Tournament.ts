import type { GameId, Outcome } from './Actions'
import type { DartPlayer, Opponent } from './Player'

export type TournamentMatch = {
  id: number
  player1?: DartPlayer
  player2?: DartPlayer
  winner?: DartPlayer
  children?: [TournamentMatch, TournamentMatch] // Previous matches
  roundNumber: number
  parentId?: number
  parentSlot?: 'player1' | 'player2'
}

export type Tournament = {
  average: number
  players: DartPlayer[]
  matches: TournamentMatch[]
  gameId: GameId
  gameOptions?: { [key: string]: any }
  reward?: Outcome
  penalty?: Outcome
}

export type TournamentOptions = {
  players: number | DartPlayer[]
  average: number
  gameId: GameId
  gameOptions?: { [key: string]: any }
  opponents?: Opponent[]
  reward?: Outcome
  penalty?: Outcome
}
