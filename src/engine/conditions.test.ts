import { describe, expect, it } from 'vitest'
import { checkCondition, evaluate, referencedStories } from './conditions'
import { createGameState } from './save'

const state = {
  ...createGameState('Phil'),
  reputation: 25,
  completedStories: ['welcome'],
  flags: { metBob: true },
}

describe('evaluate', () => {
  it('treats a missing condition as true', () => {
    expect(evaluate(undefined, state)).toBe(true)
  })

  it('reads state', () => {
    expect(evaluate('reputation >= 20', state)).toBe(true)
    expect(evaluate('reputation >= 30', state)).toBe(false)
    expect(evaluate('flags.metBob && stats.matchesWon == 0', state)).toBe(true)
    expect(evaluate('flags.unknown', state)).toBe(false)
  })

  it('supports completed()', () => {
    expect(evaluate('completed("welcome")', state)).toBe(true)
    expect(evaluate('completed("other")', state)).toBe(false)
  })

  it('is false for broken conditions instead of throwing', () => {
    expect(evaluate('reputation >=', state)).toBe(false)
  })
})

describe('checkCondition', () => {
  it('reports syntax errors', () => {
    expect(checkCondition('reputation >= 20')).toBeNull()
    expect(checkCondition('reputation >=')).not.toBeNull()
  })
})

describe('referencedStories', () => {
  it('finds story names', () => {
    expect(
      referencedStories(`completed("a") || completed('b') && reputation > 1`),
    ).toEqual(['a', 'b'])
  })
})
