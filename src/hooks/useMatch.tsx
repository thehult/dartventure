import type { Match, MatchOptions } from '@/types/Match'
import { useMemo } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { useGameSave } from './useGameSave'
import { createOpponent, type Opponent } from '@/types/Player'
import type { GameId } from '@/types/Actions'

export const PLAYER_ID = 'player'
export const OPPONENT_ID = 'opponent'

export const useMatch = () => {
  const { playerName } = useGameSave()
  const [match, setMatch, _removeMatch] = useSessionStorage<Match | undefined>(
    'current-match',
    undefined,
  )
  const hasMatch = useMemo(() => typeof match !== 'undefined', [match])
  const gameId = useMemo(() => match?.gameId as GameId, [match])
  const players = useMemo(() => match?.players ?? [], [match])

  const createMatch = (matchOptions: MatchOptions) => {
    const opponent: Opponent =
      matchOptions.opponent ?? createOpponent(matchOptions.average ?? 50)

    const newMatch: Match = {
      id: crypto.randomUUID(),
      gameId: matchOptions.gameId,
      players: [
        {
          id: PLAYER_ID,
          name: playerName,
        },
        opponent,
      ],
      gameOptions: matchOptions.gameOptions,
      reward: matchOptions.reward,
      penalty: matchOptions.penalty,
    }
    setMatch(newMatch)
  }

  return {
    hasMatch,
    match: match as Match,
    gameId,
    players,
    createMatch,
  }
}
