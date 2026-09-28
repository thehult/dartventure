import { describe, expect, it } from 'vitest'
import { MILESTONES, playCampaign } from './pacing'

/** Deterministic pseudo-random numbers. */
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const median = (values: Array<number>) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

describe('campaign pacing', () => {
  it('can be finished by winning every match', () => {
    const result = playCampaign(60, seeded(1), 'always')
    expect(result.finished).toBe(true)
    // Every venue should take a handful of matches, not one or dozens.
    expect(result.matches).toBeGreaterThanOrEqual(35)
    expect(result.matches).toBeLessThanOrEqual(60)
  })

  // Opponents' averages have floors, so weaker players have to improve their
  // real average to get all the way. A 40 average should still get far.
  // (In simulations it becomes national champion only after hundreds of
  // matches, and doesn't win the worlds.)
  it.each([
    { average: 40, reaches: 'districtChampion' },
    { average: 50, reaches: 'worldChampion' },
    { average: 60, reaches: 'worldChampion' },
    { average: 80, reaches: 'worldChampion' },
  ] as const)(
    'is paced reasonably at average $average',
    ({ average, reaches }) => {
      const runs = Array.from({ length: 10 }, (_, i) =>
        playCampaign(average, seeded(average * 100 + i), 'model', 1000),
      )
      const rows = MILESTONES.map((m) => ({
        milestone: m,
        medianMatches: median(runs.map((r) => r.milestones[m] ?? Infinity)),
      }))
      console.log(
        `Average ${average}: median ${median(runs.map((r) => r.matches))} matches, ` +
          `${median(runs.map((r) => r.tournamentsPlayed))} tournaments, ` +
          `broke ${median(runs.map((r) => r.timesBroke))} times\n` +
          rows.map((r) => `  ${r.milestone}: ${r.medianMatches}`).join('\n'),
      )
      const reached = runs.map((r) => r.milestones[reaches] ?? Infinity)
      expect(median(reached)).toBeLessThanOrEqual(150)
      if (reaches === 'worldChampion') {
        expect(median(reached)).toBeLessThanOrEqual(130)
      }
    },
  )
})
