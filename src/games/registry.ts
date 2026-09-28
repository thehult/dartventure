import { X01, X01BasicStrategy } from '@dartgames/games'
import X01Pub from './X01/X01Pub'
import type { X01GameState, X01Options } from '@dartgames/games'
import type {
  IGame,
  IGameData,
  IGameStrategy,
  IPlayer,
  PlayerId,
} from '@dartgames/core'
import type { GameComponent } from './GameComponent'

/**
 * Everything the game needs to know about one dart game. To add a game, add
 * an entry here: nothing else has to change.
 */
export type GameDefinition = {
  name: string
  create: (players: Array<IPlayer>, options?: Record<string, unknown>) => IGame
  load: (data: IGameData<IGame>) => IGame
  createStrategy: () => IGameStrategy<any>
  /** The player's three-dart average in a game, if it can be measured. */
  measureAverage?: (game: IGame, playerId: PlayerId) => number | undefined
  /** How the game looks, per scene. `default` is used for other scenes. */
  components: { default: GameComponent } & Partial<
    Record<string, GameComponent>
  >
}

const x01: GameDefinition = {
  name: 'X01',
  create: (players, options) =>
    new X01(players, {
      startScore: 501,
      doubleOut: true,
      ...options,
    } as X01Options),
  load: (data) => new X01(data),
  createStrategy: () => new X01BasicStrategy(),
  measureAverage: (game, playerId) => {
    const history = game.getHistory() as Array<X01GameState>
    let points = 0
    let turns = 0
    for (let i = 1; i < history.length; i++) {
      if (history[i - 1].currentPlayer !== playerId) continue
      points += history[i - 1].scores[playerId] - history[i].scores[playerId]
      turns++
    }
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

export const getGameComponent = (
  gameId: string,
  sceneId: string,
): GameComponent => {
  const { components } = getGame(gameId)
  return components[sceneId] ?? components.default
}
