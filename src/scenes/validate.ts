import type { Condition, Scene, ScriptStep } from '@/types/Scene'
import type { MatchOptions } from '@/types/Match'
import type { Outcome } from '@/types/Outcome'
import { isPowerOfTwo } from '@/engine/tournament'
import { checkCondition, referencedStories } from '@/engine/conditions'

const STEP_KEYS = [
  'character',
  'dialogue',
  'choice',
  'label',
  'goto',
  'if',
  'set',
  'give',
  'match',
  'end',
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Checks scene content for mistakes that would otherwise fail silently at
 * runtime: missing fields, typos in ids, references to scenes, stories,
 * characters, labels or games that don't exist, and invalid conditions.
 * Returns one message per problem.
 */
export const validateScenes = (
  scenes: Record<string, Scene | undefined>,
  gameIds: Array<string>,
): Array<string> => {
  const errors: Array<string> = []
  const storyNames = new Map<string, string>()
  const storyReferences: Array<{ where: string; story: string }> = []

  const checkString = (where: string, value: unknown) => {
    if (typeof value !== 'string' || value === '') {
      errors.push(`${where}: expected a non-empty string`)
    }
  }
  const checkCond = (where: string, condition: Condition | undefined) => {
    if (condition === undefined) return
    if (typeof condition !== 'string') {
      errors.push(`${where}: condition must be a string`)
      return
    }
    const error = checkCondition(condition)
    if (error) errors.push(`${where}: invalid condition "${condition}": ${error}`)
    for (const story of referencedStories(condition)) {
      storyReferences.push({ where, story })
    }
  }
  const checkOutcome = (where: string, outcome: Outcome | undefined) => {
    if (outcome === undefined) return
    if (!isRecord(outcome)) {
      errors.push(`${where}: expected an outcome`)
      return
    }
    for (const key of Object.keys(outcome)) {
      if (!['money', 'reputation', 'flags'].includes(key)) {
        errors.push(`${where}: unknown outcome field "${key}"`)
      }
    }
  }
  const checkAmount = (where: string, value: unknown) => {
    if (value !== undefined && (typeof value !== 'number' || value < 0)) {
      errors.push(`${where}: expected a number of at least 0`)
    }
  }
  const checkGame = (where: string, gameId: unknown) => {
    if (typeof gameId !== 'string' || !gameIds.includes(gameId)) {
      errors.push(
        `${where}: unknown game "${String(gameId)}" (known: ${gameIds.join(', ')})`,
      )
    }
  }
  const checkMatchOptions = (where: string, options: MatchOptions) => {
    if (!isRecord(options)) {
      errors.push(`${where}: expected match options`)
      return
    }
    checkGame(where, options.gameId)
    if (options.opponent !== undefined && !isRecord(options.opponent)) {
      errors.push(`${where}.opponent: expected an object`)
    }
    checkAmount(`${where}.opponent.minAverage`, options.opponent?.minAverage)
  }

  for (const [sceneId, scene] of Object.entries(scenes)) {
    if (!scene) continue
    const at = (path: string) => `${sceneId}.yml ${path}`

    checkString(at('background'), scene.background)
    if (!isRecord(scene.characters)) {
      errors.push(at('characters: expected a map of characters'))
    }
    const characters = isRecord(scene.characters) ? scene.characters : {}
    for (const [id, character] of Object.entries(characters)) {
      checkString(at(`characters.${id}.name`), character.name)
    }

    if (!Array.isArray(scene.actions)) {
      errors.push(at('actions: expected a list'))
    }
    ;(Array.isArray(scene.actions) ? scene.actions : []).forEach((action, i) => {
      const where = at(`actions[${i}] (${action.name})`)
      checkString(`${where}.name`, action.name)
      checkString(`${where}.icon`, action.icon)
      checkString(`${where}.description`, action.description)
      checkCond(`${where}.visible`, action.visible)
      checkCond(`${where}.enabled`, action.enabled)
      switch (action.action) {
        case 'navigate':
          if (!(action.sceneId in scenes)) {
            errors.push(`${where}: unknown scene "${action.sceneId}"`)
          }
          break
        case 'panel':
          if (!['stats', 'settings', 'practice'].includes(action.panel)) {
            errors.push(`${where}: unknown panel "${String(action.panel)}"`)
          }
          break
        case 'match':
          checkMatchOptions(`${where}.options`, action.options)
          checkAmount(`${where}.entryFee`, action.entryFee)
          checkOutcome(`${where}.reward`, action.reward)
          checkOutcome(`${where}.penalty`, action.penalty)
          break
        case 'tournament':
          checkGame(`${where}.options`, action.options.gameId)
          if (!isPowerOfTwo(action.options.players)) {
            errors.push(
              `${where}.options.players: must be a power of two, got ${action.options.players}`,
            )
          }
          checkAmount(`${where}.entryFee`, action.entryFee)
          checkAmount(`${where}.options.minAverage`, action.options.minAverage)
          checkOutcome(`${where}.roundReward`, action.roundReward)
          checkOutcome(`${where}.reward`, action.reward)
          checkOutcome(`${where}.penalty`, action.penalty)
          break
        default:
          errors.push(
            `${where}: unknown action "${(action as { action: unknown }).action}"`,
          )
      }
    })

    if (!Array.isArray(scene.stories)) {
      errors.push(at('stories: expected a list'))
    }
    ;(Array.isArray(scene.stories) ? scene.stories : []).forEach((story, i) => {
      const where = at(`stories[${i}] (${story.name})`)
      checkString(`${where}.name`, story.name)
      const duplicate = storyNames.get(story.name)
      if (duplicate) {
        errors.push(`${where}: story name is already used in ${duplicate}`)
      }
      storyNames.set(story.name, `${sceneId}.yml`)
      checkCond(`${where}.when`, story.when)

      if (!Array.isArray(story.script)) {
        errors.push(`${where}.script: expected a list`)
        return
      }
      const labels = new Set(
        story.script.flatMap((step) => ('label' in step ? [step.label] : [])),
      )
      const checkLabel = (path: string, label: string | undefined) => {
        if (label !== undefined && !labels.has(label)) {
          errors.push(`${path}: unknown label "${label}"`)
        }
      }

      story.script.forEach((step: ScriptStep, j) => {
        const path = `${where}.script[${j}]`
        if (!isRecord(step)) {
          errors.push(`${path}: expected a step`)
          return
        }
        const keys = Object.keys(step).filter((k) => STEP_KEYS.includes(k))
        const unknown = Object.keys(step).filter((k) => !STEP_KEYS.includes(k))
        if (unknown.length > 0) {
          errors.push(`${path}: unknown step field(s) ${unknown.join(', ')}`)
        }
        const isIfGoto = keys.length === 2 && 'if' in step && 'goto' in step
        if (keys.length !== 1 && !isIfGoto) {
          errors.push(`${path}: expected exactly one step type, got ${keys.join(', ') || 'none'}`)
          return
        }

        if ('if' in step) {
          checkCond(path, step.if)
          checkLabel(path, step.goto)
        } else if ('character' in step) {
          if (step.character !== null && !(step.character in characters)) {
            errors.push(`${path}: unknown character "${step.character}"`)
          }
        } else if ('dialogue' in step) {
          checkString(path, step.dialogue)
        } else if ('goto' in step) {
          checkLabel(path, step.goto)
        } else if ('label' in step) {
          checkString(path, step.label)
        } else if ('choice' in step) {
          if (!Array.isArray(step.choice) || step.choice.length === 0) {
            errors.push(`${path}: expected a non-empty list of choices`)
            return
          }
          step.choice.forEach((choice, k) => {
            checkString(`${path}.choice[${k}].text`, choice.text)
            checkLabel(`${path}.choice[${k}]`, choice.goto)
            checkCond(`${path}.choice[${k}].when`, choice.when)
          })
        } else if ('set' in step) {
          if (!isRecord(step.set)) errors.push(`${path}: expected flags`)
        } else if ('give' in step) {
          checkOutcome(path, step.give)
        } else if ('match' in step) {
          checkMatchOptions(`${path}.match`, step.match)
          checkLabel(`${path}.match.onWin`, step.match.onWin)
          checkLabel(`${path}.match.onLose`, step.match.onLose)
          checkOutcome(`${path}.match.reward`, step.match.reward)
          checkOutcome(`${path}.match.penalty`, step.match.penalty)
        }
      })
    })
  }

  for (const { where, story } of storyReferences) {
    if (!storyNames.has(story)) {
      errors.push(`${where}: unknown story "${story}"`)
    }
  }
  return errors
}
