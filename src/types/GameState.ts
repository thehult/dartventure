import type { Activity } from './Activity'
import type { FlagValue } from './Outcome'
import type { Difficulty } from '@/engine/difficulty'

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
  version: 6
  playerName: string
  difficulty: Difficulty
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
