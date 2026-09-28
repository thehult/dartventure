import type { Activity } from './Activity'
import type { FlagValue } from './Outcome'

export type Stats = {
  matchesPlayed: number
  matchesWon: number
  tournamentsPlayed: number
  tournamentsWon: number
}

/**
 * Everything about one playthrough. This is the whole save file: it is
 * persisted as one object, so there is a single source of truth.
 */
export type GameState = {
  version: 5
  playerName: string
  money: number
  reputation: number
  playerAverage: number
  completedStories: Array<string>
  introducedGames: Array<string>
  flags: Record<string, FlagValue>
  stats: Stats
  /** Id of the scene the player is in. */
  location: string
  activity: Activity | null
}
