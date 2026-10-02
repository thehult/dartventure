import { evaluate } from './conditions'
import { applyOutcome } from './outcome'
import { createActiveMatch } from './match'
import type { GameState } from '@/types/GameState'
import type { Choice, ScriptStep, Story } from '@/types/Scene'

/** Guards against scripts that `goto` in a loop without waiting for input. */
const MAX_STEPS = 1000

export const findLabel = (story: Story, label: string): number | undefined => {
  const index = story.script.findIndex(
    (step) => 'label' in step && step.label === label,
  )
  return index === -1 ? undefined : index
}

/** The choices of a `choice` step whose `when` holds. */
export const availableChoices = (
  step: { choice: Array<Choice> },
  state: GameState,
): Array<Choice> => step.choice.filter((c) => evaluate(c.when, state))

const finishStory = (state: GameState, story: Story): GameState => ({
  ...state,
  completedStories: state.completedStories.includes(story.name)
    ? state.completedStories
    : [...state.completedStories, story.name],
  activity: null,
})

/**
 * Runs a story from `pc` until it reaches a step that waits for the player
 * (`dialogue`, `choice` or `match`) or ends. Leaves `activity` set to what
 * the player should see next, or `null` when the story is over.
 */
export const runScript = (
  state: GameState,
  sceneId: string,
  story: Story,
  pc: number,
  character: string | null = null,
): GameState => {
  const jump = (label: string) => {
    const target = findLabel(story, label)
    if (target === undefined) {
      console.error(`Story "${story.name}" has no label "${label}"`)
      return story.script.length
    }
    return target
  }

  for (let steps = 0; steps < MAX_STEPS; steps++) {
    if (pc >= story.script.length) return finishStory(state, story)
    const step: ScriptStep = story.script[pc]

    if ('character' in step) {
      character = step.character
      pc++
    } else if ('label' in step) {
      pc++
    } else if ('if' in step) {
      pc = evaluate(step.if, state) ? jump(step.goto) : pc + 1
    } else if ('goto' in step) {
      pc = jump(step.goto)
    } else if ('set' in step) {
      state = { ...state, flags: { ...state.flags, ...step.set } }
      pc++
    } else if ('give' in step) {
      state = applyOutcome(state, step.give)
      pc++
    } else if ('end' in step) {
      return finishStory(state, story)
    } else if ('choice' in step && availableChoices(step, state).length === 0) {
      pc++
    } else if ('dialogue' in step || 'choice' in step) {
      return {
        ...state,
        activity: { type: 'story', sceneId, story: story.name, pc, character },
      }
    } else if ('match' in step) {
      const { onWin, onLose, reward, penalty, ...options } = step.match
      const origin = {
        type: 'story' as const,
        sceneId,
        story: story.name,
        character,
        onWin: onWin === undefined ? pc + 1 : jump(onWin),
        onLose: onLose === undefined ? pc + 1 : jump(onLose),
      }
      return {
        ...state,
        activity: {
          type: 'match',
          match: createActiveMatch(state, options, origin, { reward, penalty }),
        },
      }
    } else {
      console.error(`Unknown step in story "${story.name}"`, step)
      pc++
    }
  }
  console.error(`Story "${story.name}" ran ${MAX_STEPS} steps without input`)
  return finishStory(state, story)
}

/**
 * Moves past the dialogue or choice the player is looking at. `choice` is an
 * index into `availableChoices`.
 */
export const advanceScript = (
  state: GameState,
  story: Story,
  choice?: number,
): GameState => {
  const activity = state.activity
  if (activity?.type !== 'story') return state
  const step = story.script[activity.pc]

  let pc = activity.pc + 1
  if ('choice' in step) {
    const picked =
      choice === undefined ? undefined : availableChoices(step, state)[choice]
    if (!picked) return state // Waiting for a valid choice
    if (picked.goto !== undefined) {
      pc = findLabel(story, picked.goto) ?? story.script.length
    }
  }
  return runScript(state, activity.sceneId, story, pc, activity.character)
}
