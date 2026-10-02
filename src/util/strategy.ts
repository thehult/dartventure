import { createThrower, modelFromAverage } from '@thehult/dartgames-simulation'
import type { GameId } from '@/types/Actions'
import type { DartGameStrategy } from '@thehult/dartgames-core'
import {
  X01CasualStrategy,
  X01Strategy,
  X01SteadyStrategy,
} from '@thehult/dartgames-games/x01'

/**
 * The strategy only sets the bot's style; how well it hits is decided by
 * `createGameThrower`. Beginners avoid trebles, mid-level players add treble
 * 20, and everyone else uses the whole board.
 */
export const createGameStrategy = (
  gameId: GameId,
  average: number,
): DartGameStrategy<any, any, any> => {
  switch (gameId) {
    case 'x01':
      if (average < 30) return X01CasualStrategy
      if (average < 45) return X01SteadyStrategy
      return X01Strategy
  }
}

/** Scatters the bot's darts so that aiming at treble 20 gives `average` per turn. */
export const createGameThrower = (average: number) =>
  createThrower(modelFromAverage(average))
