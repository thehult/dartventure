import type { MatchOptions } from './Match'
import type { FlagValue, Outcome } from './Outcome'
import type { TournamentOptions } from './Tournament'

/**
 * A jexl expression evaluated against the game state, e.g.
 * `reputation >= 20 && completed("welcome")`. See `engine/conditions.ts`.
 */
export type Condition = string

export interface Scene {
  background: string
  characters: Record<string, Character>
  actions: Array<Action>
  stories: Array<Story>
}

export type Character = {
  name: string
  image?: string
}

type ActionBase = {
  name: string
  icon: string
  description: string
  /** Hidden unless this holds. */
  visible?: Condition
  /** Shown greyed out unless this holds. */
  enabled?: Condition
  /** Shown when the action is disabled, e.g. "Requires 20 reputation". */
  hint?: string
}

export type MatchAction = ActionBase & {
  action: 'match'
  options: MatchOptions
  /** Money paid to play. The action is disabled if the player can't pay. */
  entryFee?: number
  reward?: Outcome
  penalty?: Outcome
}

export type TournamentAction = ActionBase & {
  action: 'tournament'
  options: TournamentOptions
  /** Money paid to enter. The action is disabled if the player can't pay. */
  entryFee?: number
  /** Applied once for every match the player wins. */
  roundReward?: Outcome
  /** Applied when the player wins the tournament. */
  reward?: Outcome
  /** Applied when the player is eliminated or withdraws. */
  penalty?: Outcome
}

export type NavigateAction = ActionBase & {
  action: 'navigate'
  sceneId: string
}

export type Action = MatchAction | TournamentAction | NavigateAction

export type Choice = {
  text: string
  /** Label to jump to. Continues with the next step if omitted. */
  goto?: string
  /** The choice is only offered if this holds. */
  when?: Condition
}

/**
 * One step of a story script. Steps that only change state (`label`, `goto`,
 * `if`, `set`, `give`, `character`) run immediately; `dialogue`, `choice` and
 * `match` wait for the player.
 */
export type ScriptStep =
  | { character: string | null }
  | { dialogue: string }
  | { choice: Array<Choice> }
  | { label: string }
  | { goto: string }
  | { if: Condition; goto: string }
  | { set: Record<string, FlagValue> }
  | { give: Outcome }
  | {
      match: MatchOptions & {
        reward?: Outcome
        penalty?: Outcome
        /** Label to continue at after a win. Next step if omitted. */
        onWin?: string
        /** Label to continue at after a loss. Next step if omitted. */
        onLose?: string
      }
    }
  | { end: true }

export type Story = {
  /** Unique across all scenes, since completed stories are tracked by name. */
  name: string
  /** Plays once, as soon as the player is in the scene and this holds. */
  when?: Condition
  script: Array<ScriptStep>
}
