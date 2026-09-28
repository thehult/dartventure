import { describe, expect, it } from 'vitest'
import {
  createBracket,
  createTournament,
  isFinished,
  nextPlayerMatch,
  playerStatus,
  recordResult,
  simulateBotMatches,
} from './tournament'
import { simulateMatch } from './simulate'
import type { SimulateMatch } from './tournament'
import type { Tournament } from '@/types/Tournament'
import { PLAYER_ID } from '@/types/Player'

/** Deterministic pseudo-random numbers. */
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

/** The first player always wins. */
const firstWins: SimulateMatch = (_, __, players) => players[0].id

const create = (players = 8): Tournament =>
  createTournament(
    { players, gameId: 'x01', relativeAverage: -10 },
    { id: PLAYER_ID, name: 'Phil' },
    60,
    seeded(42),
  )

describe('createBracket', () => {
  it('numbers rounds from the first round to the final', () => {
    const { rounds, matches } = createBracket(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    )
    expect(rounds).toBe(3)
    expect(matches.map((m) => m.round)).toEqual([1, 1, 1, 1, 2, 2, 3])
  })

  it('links each match to the next round', () => {
    const { matches } = createBracket(['a', 'b', 'c', 'd'])
    expect(matches.map((m) => m.next)).toEqual([
      { matchId: 3, slot: 'player1' },
      { matchId: 3, slot: 'player2' },
      undefined,
    ])
  })

  it('rejects player counts that are not powers of two', () => {
    expect(() => createBracket(['a', 'b', 'c'])).toThrow()
  })
})

describe('createTournament', () => {
  it('creates uniquely named bots around the relative average', () => {
    const tournament = create()
    expect(tournament.players).toHaveLength(8)
    const names = tournament.players.map((p) => p.name)
    expect(new Set(names).size).toBe(8)
    const ids = tournament.players.map((p) => p.id)
    expect(new Set(ids).size).toBe(8)
    for (const bot of tournament.players.slice(1)) {
      expect('average' in bot && bot.average).toBeGreaterThanOrEqual(45)
      expect('average' in bot && bot.average).toBeLessThanOrEqual(55)
    }
  })

  it('seeds every player exactly once', () => {
    const tournament = create()
    const seeded_ = tournament.matches
      .filter((m) => m.round === 1)
      .flatMap((m) => [m.player1, m.player2])
    expect(seeded_.sort()).toEqual(tournament.players.map((p) => p.id).sort())
  })
})

describe('recordResult', () => {
  it('moves the winner to the next match', () => {
    const tournament = create(4)
    const first = tournament.matches[0]
    const next = recordResult(tournament, first.id, first.player1!)
    expect(next.matches[0].winner).toBe(first.player1)
    expect(next.matches[2].player1).toBe(first.player1)
  })

  it('rejects a winner who is not in the match', () => {
    const tournament = create(4)
    expect(() => recordResult(tournament, 1, 'nobody')).toThrow()
  })
})

describe('simulateBotMatches', () => {
  it('plays the bot matches of the current round only', () => {
    const tournament = simulateBotMatches(create(), firstWins)
    const round1 = tournament.matches.filter((m) => m.round === 1)
    expect(round1.filter((m) => m.winner === undefined)).toHaveLength(1)
    expect(tournament.matches.filter((m) => m.round > 1 && m.winner)).toEqual(
      [],
    )
    expect(nextPlayerMatch(tournament)?.round).toBe(1)
  })

  it('plays out the rest once the player is eliminated', () => {
    let tournament = simulateBotMatches(create(), firstWins)
    const match = nextPlayerMatch(tournament)!
    const opponent =
      match.player1 === PLAYER_ID ? match.player2! : match.player1!
    tournament = recordResult(tournament, match.id, opponent)
    tournament = simulateBotMatches(tournament, firstWins)
    expect(playerStatus(tournament)).toBe('eliminated')
    expect(isFinished(tournament)).toBe(true)
  })

  it('crowns the player after winning every round', () => {
    let tournament = simulateBotMatches(create(), firstWins)
    for (let round = 1; round <= tournament.rounds; round++) {
      const match = nextPlayerMatch(tournament)!
      expect(match.round).toBe(round)
      tournament = recordResult(tournament, match.id, PLAYER_ID)
      tournament = simulateBotMatches(tournament, firstWins)
    }
    expect(playerStatus(tournament)).toBe('champion')
    expect(isFinished(tournament)).toBe(true)
  })

  it('works with real simulated matches', () => {
    const tournament = simulateBotMatches(create(), simulateMatch)
    expect(
      tournament.matches.filter((m) => m.round === 1 && m.winner),
    ).toHaveLength(3)
  })
})
