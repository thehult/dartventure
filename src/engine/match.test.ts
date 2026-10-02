import { describe, expect, it } from 'vitest'
import { resolveAverage } from './match'

describe('resolveAverage', () => {
  it('plays relative to the player, above the minimum', () => {
    expect(resolveAverage({ relativeAverage: -10 }, 60)).toBe(50)
    expect(resolveAverage({ relativeAverage: -10, minAverage: 55 }, 60)).toBe(
      55,
    )
    expect(resolveAverage({ average: 40, relativeAverage: -10 }, 60)).toBe(40)
  })

  it('never goes outside what bots can play', () => {
    expect(resolveAverage({ relativeAverage: -20 }, 20)).toBe(15)
    expect(resolveAverage({ relativeAverage: 20 }, 100)).toBe(110)
  })

  it('shifts opponents and scales minimums with the difficulty', () => {
    const options = { relativeAverage: -10, minAverage: 40 }
    // Easy ignores minimums, so a weak player gets weak opponents.
    expect(resolveAverage(options, 30, 'easy')).toBe(16)
    expect(resolveAverage(options, 30, 'normal')).toBe(40)
    expect(resolveAverage(options, 30, 'hard')).toBe(46)
    expect(resolveAverage(options, 30, 'pro')).toBe(52)
    // Strong players are above the minimums, so only the offset matters.
    expect(resolveAverage(options, 80, 'easy')).toBe(66)
    expect(resolveAverage(options, 80, 'normal')).toBe(70)
    expect(resolveAverage(options, 80, 'hard')).toBe(73)
    expect(resolveAverage(options, 80, 'pro')).toBe(75)
  })

  it('shifts absolute averages too', () => {
    expect(resolveAverage({ average: 40 }, 60, 'pro')).toBe(45)
  })
})
