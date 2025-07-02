type GameSaveV1 = {
  version: 1
  money: number
  reputation: number
  completedStories: string[]
}

type GameSaveV2 = {
  version: 2
  playerName: string
  money: number
  reputation: number
  completedStories: string[]
}

type GameSaveV3 = {
  version: 3
  playerName: string
  money: number
  reputation: number
  completedStories: string[]
  introducedGames: string[]
}

const migrations = {
  1: (original: GameSaveV1): GameSaveV2 => ({
    ...original,
    version: 2,
    playerName: 'Player',
  }),
  2: (original: GameSaveV2): GameSaveV3 => ({
    ...original,
    version: 3,
    introducedGames: [],
  }),
}

export type GameSaveVersions = GameSaveV1 | GameSaveV2 | GameSaveV3 // Should include all versions
export type GameSave = GameSaveV3 // Should always be the latest version

export const migrateGameSave = (
  gameSave: GameSaveVersions,
): GameSaveVersions => {
  while (gameSave.version in migrations) {
    const migration = migrations[
      gameSave.version as keyof typeof migrations
    ] as (original: GameSaveVersions) => GameSaveVersions
    if (migration) {
      gameSave = migration(gameSave)
    } else {
      break
    }
  }
  return gameSave
}
