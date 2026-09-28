import type { ActiveMatch } from './Match'
import type { Outcome } from './Outcome'
import type { Tournament } from './Tournament'

/** A story being played in the current scene. */
export type StoryActivity = {
  type: 'story'
  sceneId: string
  story: string
  /** Index of the script step waiting for the player. */
  pc: number
  /** Id of the character on screen, if any. */
  character: string | null
}

/** A single match, started from an action or a story. */
export type MatchActivity = {
  type: 'match'
  match: ActiveMatch
}

export type TournamentActivity = {
  type: 'tournament'
  tournament: Tournament
  /** The player's match currently being played. */
  match?: ActiveMatch
  roundReward?: Outcome
  reward?: Outcome
  penalty?: Outcome
}

/** What the player is doing. `null` means they are free to act in the scene. */
export type Activity = StoryActivity | MatchActivity | TournamentActivity
