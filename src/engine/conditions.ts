import jexlModule from 'jexl'
import type { GameState } from '@/types/GameState'
import type { Condition } from '@/types/Scene'

/**
 * Conditions are jexl expressions (https://github.com/TomFrost/Jexl) with
 * these variables and functions available:
 *
 * - `money`, `reputation`, `playerAverage`, `playerName`, `location`
 * - `stats.matchesPlayed`, `stats.matchesWon`, `stats.tournamentsPlayed`,
 *   `stats.tournamentsWon`
 * - `flags.<name>`: flags set by `set` script steps and outcomes
 * - `completed("story-name")`: whether a story has been completed
 */
const jexl = new jexlModule.Jexl()

// Functions read the state being evaluated through this variable, since jexl
// functions don't receive the context.
let current: GameState | null = null
jexl.addFunction(
  'completed',
  (story: string) => current?.completedStories.includes(story) ?? false,
)

const cache = new Map<string, ReturnType<typeof jexl.compile>>()
const compile = (condition: Condition) => {
  let expression = cache.get(condition)
  if (!expression) {
    expression = jexl.compile(condition)
    cache.set(condition, expression)
  }
  return expression
}

const context = (state: GameState) => ({
  money: state.money,
  reputation: state.reputation,
  playerAverage: state.playerAverage,
  playerName: state.playerName,
  location: state.location,
  stats: state.stats,
  flags: state.flags,
})

/** Whether a condition holds. A missing condition always holds. */
export const evaluate = (
  condition: Condition | undefined,
  state: GameState,
): boolean => {
  if (condition === undefined || condition.trim() === '') return true
  current = state
  try {
    return Boolean(compile(condition).evalSync(context(state)))
  } catch (error) {
    console.error(`Failed to evaluate condition "${condition}"`, error)
    return false
  } finally {
    current = null
  }
}

/** Returns a syntax error message, or null if the condition is valid. */
export const checkCondition = (condition: Condition): string | null => {
  try {
    compile(condition)
    return null
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

/** Story names referenced through `completed("...")`. */
export const referencedStories = (condition: Condition): Array<string> =>
  [...condition.matchAll(/completed\(\s*["']([^"']+)["']\s*\)/g)].map(
    (m) => m[1],
  )
