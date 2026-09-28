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

  it('leaves a current save untouched', () => {
    const save = createGameState('Phil')
    expect(migrateSave(save)).toBe(save)
  })
})
