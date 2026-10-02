import { describe, expect, it } from 'vitest'
import { applyOutcome, formatOutcome } from './outcome'
import { createGameState } from './save'

describe('applyOutcome', () => {
  it('adds values, sets flags and never goes below zero', () => {
    const state = { ...createGameState('Phil'), money: 5, reputation: 3 }
    const next = applyOutcome(state, {
      money: 10,
      reputation: -5,
      flags: { won: true },
    })
    expect(next.money).toBe(15)
    expect(next.reputation).toBe(0)
    expect(next.flags).toEqual({ won: true })
  })
})

describe('formatOutcome', () => {
  it('formats gains and losses', () => {
    expect(formatOutcome({ money: 10, reputation: -5 })).toBe(
      '**+$10** and **-5** *reputation*!',
    )
  })

  it('leaves out zero values', () => {
    expect(formatOutcome({ money: 0, reputation: 5 })).toBe(
      '**+5** *reputation*!',
    )
    expect(formatOutcome({ money: 0 })).toBe('')
    expect(formatOutcome(undefined)).toBe('')
  })
})
