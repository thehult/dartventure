import { beforeAll, describe, expect, it, vi } from 'vitest'
import { MILESTONES, playCampaign } from './pacing'
import type { CampaignResult } from './pacing'
import type { Difficulty } from '@/engine/difficulty'

/** Simulations play hundreds of matches. */
const TIMEOUT = 120_000

/** Deterministic pseudo-random numbers. */
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const median = (values: Array<number>) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

/** Plays 10 campaigns and prints how long each milestone took. */
const simulate = (
  difficulty: Difficulty,
  average: number,
): Array<CampaignResult> => {
  const runs = Array.from({ length: 10 }, (_, i) =>
    playCampaign(average, seeded(average * 100 + i), 'model', 1000, difficulty),
  )
  console.info(
    `${difficulty} at average ${average}: ` +
      `median ${median(runs.map((r) => (r.finished ? r.matches : Infinity)))} matches, ` +
      `${runs.filter((r) => r.finished).length}/10 finished\n` +
      MILESTONES.map(
        (m) =>
          `  ${m}: ${median(runs.map((r) => r.milestones[m] ?? Infinity))}`,
      ).join('\n'),
  )
  return runs
}

const matchesTo = (
  runs: Array<CampaignResult>,
  milestone: (typeof MILESTONES)[number] = 'worldChampion',
) => median(runs.map((r) => r.milestones[milestone] ?? Infinity))

describe('campaign pacing', () => {
  beforeAll(() => {
    // The bots' strategy logs every throw, which adds up to a lot of output.
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('can be finished by winning every match', () => {
    const result = playCampaign(60, seeded(1), 'always')
    expect(result.finished).toBe(true)
    // Every venue should take a handful of matches, not one or dozens.
    expect(result.matches).toBeGreaterThanOrEqual(35)
    expect(result.matches).toBeLessThanOrEqual(60)
  })

  it(
    'lets anyone finish on easy',
    () => {
      expect(matchesTo(simulate('easy', 30))).toBeLessThanOrEqual(150)
      expect(matchesTo(simulate('easy', 80))).toBeLessThanOrEqual(150)
    },
    TIMEOUT,
  )

  it(
    'expects some skill on normal',
    () => {
      // A 40 average gets through the district, but the worlds need about 50.
      expect(
        matchesTo(simulate('normal', 40), 'districtChampion'),
      ).toBeLessThanOrEqual(150)
      expect(matchesTo(simulate('normal', 60))).toBeLessThanOrEqual(200)
    },
    TIMEOUT,
  )

  it(
    'challenges strong players on hard and pro',
    () => {
      const easy = matchesTo(simulate('easy', 80))
      const hard = matchesTo(simulate('hard', 80))
      expect(hard).toBeGreaterThan(easy)
      expect(hard).toBeLessThanOrEqual(400)

      const pro = simulate('pro', 90)
      expect(pro.filter((r) => r.finished).length).toBeGreaterThanOrEqual(5)
    },
    TIMEOUT,
  )
})
