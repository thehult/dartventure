import type { GameId } from '@/types/Actions'
import type { DartGameStrategy } from '@thehult/dartgames-core'
import {
  X01CasualStrategy,
  X01Strategy,
  X01SteadyStrategy,
} from '@thehult/dartgames-games/x01'

/**
 * Picks a bot by the opponent's average (points per turn): beginners throw
 * singles, steady players add treble 20, strong players use the whole board.
 */
export const createGameStrategy = (
  gameId: GameId,
  average: number,
): DartGameStrategy<any, any, any> => {
  switch (gameId) {
    case 'x01':
      if (average < 40) return X01CasualStrategy
      if (average < 75) return X01SteadyStrategy
      return X01Strategy
  }
}
