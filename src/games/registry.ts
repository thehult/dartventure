import { stateAfterTurn } from '@thehult/dartgames-core'
import {
  X01CasualStrategy,
  X01Game,
  X01SteadyStrategy,
  X01Strategy,
} from '@thehult/dartgames-games/x01'
import X01Pub from './X01/X01Pub'
import type {
  DartGame,
  DartGameStrategy,
  GameHistory,
} from '@thehult/dartgames-core'
import type { X01Config, X01State } from '@thehult/dartgames-games/x01'
import type { GameComponent } from './GameComponent'

/**
 * Everything the game needs to know about one dart game. To add a game, add
 * an entry here: nothing else has to change.
 */
export type GameDefinition = {
  name: string
  game: DartGame<any, any, any, any>
  /** The game's config, which a match's `gameOptions` override. */
  defaultConfig: Record<string, unknown>
  /**
   * How a bot with this three-dart average chooses where to aim. Where the
   * darts land is decided by the average, see `createThrower`.
   */
  createStrategy: (average: number) => DartGameStrategy<any, any, any>
  /** The player's three-dart average in a game, if it can be measured. */
  measureAverage?: (
    history: GameHistory<any, any, any>,
    state: any,
    playerId: string,
  ) => number | undefined
  /** How the game looks, per scene. `default` is used for other scenes. */
  components: { default: GameComponent } & Partial<
    Record<string, GameComponent>
  >
}

/**
 * X01 planning searches for the best finish, which takes about a millisecond
 * and adds up when bots play whole tournaments. Where to aim next only
 * depends on the score, the checkout rule and the darts thrown so far.
 */
const memoizeX01 = (
  strategy: DartGameStrategy<X01State, any, any>,
): DartGameStrategy<X01State, any, any> => {
  const cache = new Map<string, ReturnType<typeof strategy.selectTarget>>()
  return {
    ...strategy,
    selectTarget: (state, history, thrown) => {
      const key = JSON.stringify([
        state.players[state.currentPlayerIndex].remainingScore,
        state.config.checkoutRule,
        thrown,
      ])
      if (!cache.has(key)) {
        cache.set(key, strategy.selectTarget(state, history, thrown))
      }
      return cache.get(key)!
    },
  }
}

const x01Strategies = {
  casual: memoizeX01(X01CasualStrategy),
  steady: memoizeX01(X01SteadyStrategy),
  full: memoizeX01(X01Strategy),
}

const x01: GameDefinition = {
  name: 'X01',
  game: X01Game,
  defaultConfig: {
    startingScore: 501,
    checkoutRule: 'double-out',
  } satisfies X01Config,
  // Beginners avoid trebles, mid-level players add treble 20, and everyone
  // else uses the whole board.
  createStrategy: (average) => {
    if (average < 30) return x01Strategies.casual
    if (average < 45) return x01Strategies.steady
    return x01Strategies.full
  },
  measureAverage: (
    history: GameHistory<X01State, any, any>,
    state,
    playerId,
  ) => {
    let points = 0
    let turns = 0
    history.turns.forEach((turn, i) => {
      const before = turn.stateBefore
      const index = before.currentPlayerIndex
      if (before.players[index].id !== playerId) return
      const after = stateAfterTurn(history, i, state) as X01State
      points +=
        before.players[index].remainingScore -
        after.players[index].remainingScore
      turns++
    })
    return turns > 0 ? points / turns : undefined
  },
  components: {
    default: X01Pub,
    pub: X01Pub,
  },
}

export const games: Record<string, GameDefinition | undefined> = { x01 }

export const gameIds = () => Object.keys(games)

export const getGame = (gameId: string): GameDefinition => {
  const game = games[gameId]
  if (!game) throw new Error(`Unknown game "${gameId}"`)
  return game
}

/** The config a match is played with. */
export const getGameConfig = (
  gameId: string,
  options?: Record<string, unknown>,
) => ({ ...getGame(gameId).defaultConfig, ...options })

export const getGameComponent = (
  gameId: string,
  sceneId: string,
): GameComponent => {
  const { components } = getGame(gameId)
  return components[sceneId] ?? components.default
}
