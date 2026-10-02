import { describe, expect, it } from 'vitest'
import { CURRENT_VERSION, createGameState, migrateSave } from './save'

describe('migrateSave', () => {
  it('migrates a v1 save to the current version', () => {
    const save = migrateSave({
      version: 1,
      money: 10,
      reputation: 20,
      completedStories: ['welcome'],
    })
    expect(save).toEqual({
      ...createGameState('Player'),
      money: 10,
      reputation: 20,
      completedStories: ['welcome'],
    })
  })

  it('keeps data from a v4 save', () => {
    const save = migrateSave({
      version: 4,
      playerName: 'Phil',
      money: 0,
      reputation: 5,
      completedStories: [],
      introducedGames: ['x01'],
      playerAverage: 72,
    })
    expect(save.version).toBe(CURRENT_VERSION)
    expect(save.playerName).toBe('Phil')
    expect(save.playerAverage).toBe(72)
    expect(save.activity).toBeNull()
  })

  it('adds the normal difficulty to a v5 save', () => {
    const { difficulty: _, ...current } = createGameState('Phil')
    const save = migrateSave({ ...current, version: 5 })
    expect(save.version).toBe(CURRENT_VERSION)
    expect(save.difficulty).toBe('normal')
  })

  it('leaves a current save untouched', () => {
    const save = createGameState('Phil')
    expect(migrateSave(save)).toBe(save)
  })
})

describe('createGameState', () => {
  it('starts at the starting average of the difficulty', () => {
    expect(createGameState('Phil', { difficulty: 'easy' }).playerAverage).toBe(
      30,
    )
    expect(createGameState('Phil').playerAverage).toBe(50)
    expect(createGameState('Phil', { difficulty: 'pro' }).playerAverage).toBe(
      80,
    )
  })

  it('starts with the chosen difficulty and average', () => {
    const state = createGameState('Phil', {
      difficulty: 'easy',
      playerAverage: 32,
    })
    expect(state.difficulty).toBe('easy')
    expect(state.playerAverage).toBe(32)
  })
})
