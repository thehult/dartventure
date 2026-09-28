import type { Match, MatchOptions } from '@/types/Match'
import { useEffect, useMemo, useRef } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { useGameSave } from './useGameSave'
import { createOpponent, type Opponent } from '@/types/Player'
import type { GameId } from '@/types/Actions'
import type { IGame, IGameData } from '@dartgames/core'

export const PLAYER_ID = 'player'
export const OPPONENT_ID = 'opponent'

export const useMatch = () => {
  const { playerName } = useGameSave()
  const [match, setMatch, _removeMatch] = useSessionStorage<Match | undefined>(
    'current-match',
    undefined,
  )
  const [gameData, setGameData] = useSessionStorage<IGameData<any> | undefined>(
    'current-game-data',
    undefined,
  )
  const initialGameData = useRef(gameData)

  useEffect(() => {
    if (!initialGameData.current) {
      initialGameData.current = gameData
    }
  }, [gameData])

  const hasMatch = useMemo(() => typeof match !== 'undefined', [match])
  const gameId = useMemo(() => match?.gameId as GameId, [match])
  const players = useMemo(() => match?.players ?? [], [match])

  const createMatch = (matchOptions: MatchOptions) => {
    const opponent: Opponent =
      matchOptions.opponent ?? createOpponent(matchOptions.average ?? 50)

    const newMatch: Match = {
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

  const saveGameData = (game: IGame) => {
    setGameData(game.toJson())
  }

  return {
    hasMatch,
    match: match as Match,
    gameId,
    initialGameData: initialGameData.current,
    players,
    createMatch,
    saveGameData,
  }
}
