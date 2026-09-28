import { DEFAULT_DIFFICULTY } from './difficulty'
import type { Difficulty } from './difficulty'
import type { GameState } from '@/types/GameState'

export const START_LOCATION = 'world'
export const DEFAULT_PLAYER_AVERAGE = 50

type SaveV1 = {
  version: 1
  money: number
  reputation: number
  completedStories: Array<string>
}
type SaveV2 = Omit<SaveV1, 'version'> & { version: 2; playerName: string }
type SaveV3 = Omit<SaveV2, 'version'> & {
  version: 3
  introducedGames: Array<string>
}
type SaveV4 = Omit<SaveV3, 'version'> & { version: 4; playerAverage: number }
type SaveV5 = Omit<GameState, 'version' | 'difficulty'> & { version: 5 }
type SaveV6 = GameState

/** Every save format that has ever existed. */
export type AnySave = SaveV1 | SaveV2 | SaveV3 | SaveV4 | SaveV5 | SaveV6
export const CURRENT_VERSION: GameState['version'] = 6

const migrations: {
  [V in Exclude<AnySave['version'], GameState['version']>]: (
    save: Extract<AnySave, { version: V }>,
  ) => AnySave
} = {
  1: (save) => ({ ...save, version: 2, playerName: 'Player' }),
  2: (save) => ({ ...save, version: 3, introducedGames: [] }),
  3: (save) => ({
    ...save,
    version: 4,
    playerAverage: DEFAULT_PLAYER_AVERAGE,
  }),
  4: (save) => ({
    ...save,
    version: 5,
    flags: {},
    stats: {
      matchesPlayed: 0,
      matchesWon: 0,
      tournamentsPlayed: 0,
      tournamentsWon: 0,
    },
    location: START_LOCATION,
    activity: null,
  }),
  5: (save) => ({ ...save, version: 6, difficulty: DEFAULT_DIFFICULTY }),
}

export const migrateSave = (save: AnySave): GameState => {
  while (save.version !== CURRENT_VERSION) {
    const migrate = migrations[save.version] as (s: AnySave) => AnySave
    save = migrate(save)
  }
  return save
}

export const createGameState = (
  playerName: string,
  options: { difficulty?: Difficulty; playerAverage?: number } = {},
): GameState => ({
  version: CURRENT_VERSION,
  playerName,
  difficulty: options.difficulty ?? DEFAULT_DIFFICULTY,
  money: 0,
  reputation: 0,
  playerAverage: options.playerAverage ?? DEFAULT_PLAYER_AVERAGE,
  completedStories: [],
  introducedGames: [],
  flags: {},
  stats: {
    matchesPlayed: 0,
    matchesWon: 0,
    tournamentsPlayed: 0,
    tournamentsWon: 0,
  },
  location: START_LOCATION,
  activity: null,
})
