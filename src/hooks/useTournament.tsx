import type { DartPlayer } from '@/types/Player'
import {
  type Tournament,
  type TournamentMatch,
  type TournamentOptions,
} from '@/types/Tournament'
import { useLocalStorage } from 'usehooks-ts'
import { useGameSave } from './useGameSave'
import { randomMaleName } from '@/util/names'
import { useCallback, useMemo } from 'react'

const PLAYER_ID = 'player'

export function useTournament() {
  const { playerName } = useGameSave()
  const [tournament, setTournament, removeTournament] = useLocalStorage<
    Tournament | undefined
  >('current-tournament', undefined)

  const hasTournament = useMemo(
    () => typeof tournament !== 'undefined',
    [tournament],
  )

  const rootMatch = useMemo(
    () => tournament?.matches[tournament.matches.length - 1],
    [tournament],
  )

  const nextPlayerMatch = useMemo(
    () =>
      tournament?.matches.find(
        (m) =>
          typeof m.winner === 'undefined' &&
          (m.player1?.id === PLAYER_ID || m.player2?.id === PLAYER_ID),
      ),
    [tournament],
  )

  const currentRound = useMemo(
    () =>
      tournament?.matches
        .filter((m) => typeof m.winner === 'undefined')
        .sort((a, b) => a.roundNumber - b.roundNumber)?.[0].roundNumber ?? 1,
    [tournament],
  )

  const createTournamentTree = (players: DartPlayer[]) => {
    let matchId = 1
    const matches: TournamentMatch[] = []
    const _createMatches = (
      participants: DartPlayer[],
      parentId?: number,
      parentSlot?: 'player1' | 'player2',
    ): TournamentMatch => {
      const roundNumber = Math.ceil(Math.log2(players.length))
      if (participants.length === 2) {
        const match: TournamentMatch = {
          id: matchId++,
          player1: participants[0],
          player2: participants[1],
          roundNumber,
          parentId,
          parentSlot,
        }
        matches.push(match)
        return match
      }

      const _matchId = matchId++
      const mid = participants.length / 2
      const left = _createMatches(
        participants.slice(0, mid),
        _matchId,
        'player1',
      )
      const right = _createMatches(participants.slice(mid), _matchId, 'player2')
      const match: TournamentMatch = {
        id: _matchId,
        children: [left, right],
        roundNumber,
        parentId,
        parentSlot,
      }
      matches.push(match)
      return match
    }
    _createMatches(players)
    return matches
  }

  const createTournament = (options: TournamentOptions) =>
    useCallback(() => {
      let players: DartPlayer[] = []
      if (typeof options.players === 'number') {
        const newPlayers: DartPlayer[] = [{ id: PLAYER_ID, name: playerName }]
        while (newPlayers.length < options.players) {
          const name = randomMaleName()
          newPlayers.push({
            id: 'bot-' + name.toLowerCase(),
            name,
          })
        }
        players = newPlayers
      } else {
        players = [...options.players]
      }
      const matches = createTournamentTree(players)
      setTournament({
        average: options.average,
        players,
        matches,
        gameId: options.gameId,
        gameOptions: options.gameOptions,
      })
    }, [])

  const leaveTournament = () =>
    useCallback(() => {
      removeTournament()
    }, [tournament])

  return {
    tournament,
    hasTournament,
    rootMatch,
    nextPlayerMatch,
    currentRound,
    createTournament,
    leaveTournament,
  }
}
