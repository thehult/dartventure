export type FlagValue = boolean | number | string

/** A change to the player's progress, e.g. the reward for winning a match. */
export interface Outcome {
  money?: number
  reputation?: number
  /** Flags to set, readable from conditions as `flags.<name>`. */
  flags?: Record<string, FlagValue>
}
