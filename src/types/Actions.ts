import type { SceneId } from '@/scenes/scenes'
import type { Requirement } from './Requirement'

export type GameId = 'x01'

export interface Opponent {
  name?: string
  average: number
  strategy?: string
}

export interface Outcome {
  money?: number
  reputation?: number
}

type ActionBase = {
  name: string
  icon: string
  description: string
  unlocked_by?: string
  requirements?: Requirement[]
}
type ActionMatch = ActionBase & {
  action: 'match'
  gameId: GameId
  gameOptions?: { [key: string]: any }
  opponent: Opponent
  reward?: Outcome
  penalty?: Outcome
}
type ActionTournament = ActionBase & {
  action: 'tournament'
  gameId: GameId
  gameOptions?: { [key: string]: any }
}
type ActionNavigate = ActionBase & {
  action: 'navigate'
  sceneId: SceneId
}
export type Action = ActionMatch | ActionTournament | ActionNavigate
