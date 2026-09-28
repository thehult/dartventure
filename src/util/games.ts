import type { GameId } from '@/types/Actions'
import type { DartPlayer } from '@/types/Player'
import type { IGame } from '@dartgames/core'
import { X01, X01BasicStrategy, type X01Options } from '@dartgames/games'

export const createGame = (
  gameId: GameId,
  players: DartPlayer[],
  options?: any,
  state?: any,
): IGame => {
  switch (gameId) {
    case 'x01':
      return new X01(players, options as X01Options, state)
  }
}

export const createGameStrategy = (gameId: GameId) => {
  switch (gameId) {
    case 'x01':
      return new X01BasicStrategy()
  }
}
