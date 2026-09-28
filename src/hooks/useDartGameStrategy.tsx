import type { GameId } from '@/types/Actions'
import type { IGameStrategy } from '@dartgames/core'
import { X01BasicStrategy } from '@dartgames/games'
import { useMemo } from 'react'

export function useDartGameStrategy(gameId: GameId) {
  return useMemo<IGameStrategy<any>>(() => {
    switch (gameId) {
      case 'x01':
        return new X01BasicStrategy()
    }
  }, [gameId])
}
