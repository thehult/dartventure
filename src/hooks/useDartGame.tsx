'use strict'

import type { GameId } from '@/types/Actions'
import type { DartPlayer } from '@/types/Player'
import { createGame } from '@/util/games'
import { useRef } from 'react'

export function useDartGame(
  gameId: GameId,
  players: DartPlayer[],
  options?: any,
  state?: any,
) {
  console.log('useDartGame params:', { gameId, players, options, state })
  const game = useRef(createGame(gameId, players, options, state))
  return game.current
}
