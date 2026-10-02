import { randomMaleName } from '@/util/names'

export const PLAYER_ID = 'player'
export const OPPONENT_ID = 'opponent'

export interface DartPlayer {
  id: string
  name: string
}

export interface Opponent extends DartPlayer {
  average: number
  strategy?: string
}

export function createOpponent(name: string, average: number): Opponent
export function createOpponent(average: number): Opponent
export function createOpponent(
  nameOrAverage: string | number,
  average?: number,
): Opponent {
  const clampAverage = (avg: number) => Math.max(15, Math.min(110, avg))

  if (typeof nameOrAverage === 'string') {
    return {
      id: OPPONENT_ID,
      name: nameOrAverage,
      average: clampAverage(average ?? 0),
    }
  }
  return {
    id: OPPONENT_ID,
    name: randomMaleName(),
    average: clampAverage(nameOrAverage ?? 0),
  }
}
