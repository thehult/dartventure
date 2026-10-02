import { describe, expect, it } from 'vitest'
import { advanceScript, runScript } from './story'
import { createGameState } from './save'
import type { StoryActivity } from '@/types/Activity'
import type { GameState } from '@/types/GameState'
import type { Story } from '@/types/Scene'

const start = (story: Story, state: GameState = createGameState('Phil')) =>
  runScript(state, 'pub', story, 0)

const pc = (state: GameState) => (state.activity as StoryActivity).pc

describe('runScript', () => {
  it('stops at dialogue and tracks the character', () => {
    const story: Story = {
      name: 's',
      script: [{ character: 'bob' }, { dialogue: 'Hi' }, { dialogue: 'Bye' }],
    }
    let state = start(story)
    expect(state.activity).toEqual({
      type: 'story',
      sceneId: 'pub',
      story: 's',
      pc: 1,
      character: 'bob',
    })
    state = advanceScript(state, story)
    expect(pc(state)).toBe(2)
    state = advanceScript(state, story)
    expect(state.activity).toBeNull()
    expect(state.completedStories).toEqual(['s'])
  })

  it('runs set, give, if and goto without waiting', () => {
    const story: Story = {
      name: 's',
      script: [
        { set: { met: true } },
        { give: { money: 10 } },
        { if: 'flags.met', goto: 'rich' },
        { dialogue: 'skipped' },
        { label: 'rich' },
        { dialogue: 'You have money' },
      ],
    }
    const state = start(story)
    expect(state.flags).toEqual({ met: true })
    expect(state.money).toBe(10)
    expect(pc(state)).toBe(5)
  })

  it('branches on choices and hides unavailable ones', () => {
    const story: Story = {
      name: 's',
      script: [
        {
          choice: [
            { text: 'Secret', when: 'flags.secret' },
            { text: 'Yes', goto: 'yes' },
            { text: 'No' },
          ],
        },
        { dialogue: 'No then' },
        { end: true },
        { label: 'yes' },
        { dialogue: 'Great' },
      ],
    }
    const state = start(story)
    expect(pc(state)).toBe(0)
    // Index 0 is "Yes", since "Secret" isn't available.
    expect(pc(advanceScript(state, story, 0))).toBe(4)
    expect(pc(advanceScript(state, story, 1))).toBe(1)
    // Waits for a valid choice.
    expect(advanceScript(state, story)).toBe(state)
    expect(advanceScript(state, story, 5)).toBe(state)
  })

  it('ends at an end step', () => {
    const story: Story = {
      name: 's',
      script: [{ end: true }, { dialogue: 'never' }],
    }
    expect(start(story).activity).toBeNull()
  })

  it('starts a match that remembers where to resume', () => {
    const story: Story = {
      name: 's',
      script: [
        { character: 'bob' },
        {
          match: {
            gameId: 'x01',
            opponent: { name: 'Bob', average: 40 },
            onLose: 'lost',
          },
        },
        { dialogue: 'Well played' },
        { label: 'lost' },
        { dialogue: 'Better luck next time' },
      ],
    }
    const state = start(story)
    expect(state.activity?.type).toBe('match')
    if (state.activity?.type !== 'match') return
    expect(state.activity.match.players[1]).toMatchObject({
      name: 'Bob',
      average: 40,
    })
    expect(state.activity.match.origin).toEqual({
      type: 'story',
      sceneId: 'pub',
      story: 's',
      character: 'bob',
      onWin: 2,
      onLose: 3,
    })
  })

  it('does not hang on scripts that loop without input', () => {
    const story: Story = {
      name: 's',
      script: [{ label: 'a' }, { goto: 'a' }],
    }
    expect(start(story).activity).toBeNull()
  })
})
