import type { GameId } from '@/types/Actions'
import { X01Game } from '@thehult/dartgames-games/x01'

export const getGame = (gameId: GameId) => {
  switch (gameId) {
    case 'x01':
      return X01Game
  }
}
