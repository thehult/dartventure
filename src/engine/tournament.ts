import { resolveAverage } from './match'
import { DEFAULT_DIFFICULTY } from './difficulty'
import type { Difficulty } from './difficulty'
import type { PlayerId } from '@dartgames/core'
import type { BotPlayer, DartPlayer } from '@/types/Player'
import type {
  BracketMatch,
  Tournament,
  TournamentOptions,
  TournamentStatus,
} from '@/types/Tournament'
import type { GameOptions } from '@/types/Match'
import { PLAYER_ID, clampAverage, isBot } from '@/types/Player'
import { randomMaleNames } from '@/util/names'

type Random = () => number
export type SimulateMatch = (
  gameId: string,
  gameOptions: GameOptions | undefined,
  players: Array<BotPlayer>,
) => PlayerId

const DEFAULT_SPREAD = 5

export const isPowerOfTwo = (n: number) =>
  Number.isInteger(n) && n >= 2 && (n & (n - 1)) === 0

const shuffle = <T>(items: Array<T>, random: Random): Array<T> => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Builds a single-elimination bracket for a power-of-two number of players. */
export const createBracket = (
  seeds: Array<PlayerId>,
): { rounds: number; matches: Array<BracketMatch> } => {
  if (!isPowerOfTwo(seeds.length)) {
    throw new Error(
      `A bracket needs a power of two players, got ${seeds.length}`,
    )
  }
  const rounds = Math.log2(seeds.length)
  const matches: Array<BracketMatch> = []
  let firstId = 1
  for (let round = 1; round <= rounds; round++) {
    const count = seeds.length / 2 ** round
    const nextFirstId = firstId + count
    for (let i = 0; i < count; i++) {
      matches.push({
        id: firstId + i,
        round,
        player1: round === 1 ? seeds[i * 2] : undefined,
        player2: round === 1 ? seeds[i * 2 + 1] : undefined,
        next:
          round < rounds
            ? {
                matchId: nextFirstId + Math.floor(i / 2),
                slot: i % 2 === 0 ? 'player1' : 'player2',
              }
            : undefined,
      })
    }
    firstId = nextFirstId
  }
  return { rounds, matches }
}

export const createTournament = (
  options: TournamentOptions,
  player: DartPlayer,
  playerAverage: number,
  difficulty: Difficulty = DEFAULT_DIFFICULTY,
  random: Random = Math.random,
): Tournament => {
  const baseAverage = resolveAverage(options, playerAverage, difficulty)
  const spread = options.spread ?? DEFAULT_SPREAD
  const bots: Array<BotPlayer> = randomMaleNames(
    options.players - 1,
    [player.name],
    random,
  ).map((name, i) => ({
    id: `bot-${i + 1}`,
    name,
    average: clampAverage(baseAverage + (random() * 2 - 1) * spread),
  }))
  const players = [player, ...bots]
  const { rounds, matches } = createBracket(
    shuffle(players, random).map((p) => p.id),
  )
  return {
    name: options.name ?? 'Tournament',
    gameId: options.gameId,
    gameOptions: options.gameOptions,
    players,
    rounds,
    matches,
  }
}

export const getPlayer = (tournament: Tournament, id: PlayerId) => {
  const player = tournament.players.find((p) => p.id === id)
  if (!player) throw new Error(`No player "${id}" in tournament`)
  return player
}

const involves = (match: BracketMatch, id: PlayerId) =>
  match.player1 === id || match.player2 === id

export const finalMatch = (tournament: Tournament) =>
  tournament.matches[tournament.matches.length - 1]

export const isFinished = (tournament: Tournament) =>
  finalMatch(tournament).winner !== undefined

/** The player's next match, once both of its players are known. */
export const nextPlayerMatch = (tournament: Tournament) =>
  tournament.matches.find(
    (m) =>
      m.winner === undefined &&
      m.player1 !== undefined &&
      m.player2 !== undefined &&
      involves(m, PLAYER_ID),
  )

export const playerStatus = (tournament: Tournament): TournamentStatus => {
  if (finalMatch(tournament).winner === PLAYER_ID) return 'champion'
  const lost = tournament.matches.some(
    (m) =>
      m.winner !== undefined &&
      m.winner !== PLAYER_ID &&
      involves(m, PLAYER_ID),
  )
  return lost ? 'eliminated' : 'playing'
}

/** How many matches the player has won. */
export const playerWins = (tournament: Tournament) =>
  tournament.matches.filter((m) => m.winner === PLAYER_ID).length

/** Sets a match's winner and moves them on to their next match. */
export const recordResult = (
  tournament: Tournament,
  matchId: number,
  winner: PlayerId,
): Tournament => {
  const match = tournament.matches.find((m) => m.id === matchId)
  if (!match) throw new Error(`No match ${matchId} in tournament`)
  if (!involves(match, winner)) {
    throw new Error(`"${winner}" is not playing match ${matchId}`)
  }
  return {
    ...tournament,
    matches: tournament.matches.map((m) => {
      if (m.id === matchId) return { ...m, winner }
      if (m.id === match.next?.matchId) return { ...m, [match.next.slot]: winner }
      return m
    }),
  }
}

/**
 * Simulates the matches between bots. While the player is still in, only
 * rounds up to the player's current round are played, so the bracket fills
 * in round by round. Once the player is out, the rest is played to the end.
 */
export const simulateBotMatches = (
  tournament: Tournament,
  simulate: SimulateMatch,
): Tournament => {
  for (;;) {
    const unfinished = tournament.matches.filter(
      (m) => m.winner === undefined,
    )
    if (unfinished.length === 0) return tournament

    const maxRound =
      playerStatus(tournament) === 'playing'
        ? Math.min(...unfinished.map((m) => m.round))
        : Infinity
    const ready = unfinished.find(
      (m) =>
        m.round <= maxRound &&
        m.player1 !== undefined &&
        m.player2 !== undefined &&
        !involves(m, PLAYER_ID),
    )
    if (!ready) return tournament

    const players = [ready.player1!, ready.player2!].map((id) => {
      const player = getPlayer(tournament, id)
      if (!isBot(player)) throw new Error(`"${id}" is not a bot`)
      return player
    })
    const winner = simulate(tournament.gameId, tournament.gameOptions, players)
    tournament = recordResult(tournament, ready.id, winner)
  }
}
