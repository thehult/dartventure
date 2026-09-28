import type { SceneId } from '@/scenes/scenes'
import type { Requirement } from './Requirement'
import type { TournamentOptions } from './Tournament'
import type { MatchOptions } from './Match'

export type GameId = 'x01'

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
  options: MatchOptions
  reward?: Outcome
  penalty?: Outcome
}
type ActionTournament = ActionBase & {
  action: 'tournament'
  reward?: Outcome
  penalty?: Outcome
  options: TournamentOptions
}
type ActionNavigate = ActionBase & {
  action: 'navigate'
  sceneId: SceneId
}
export type Action = ActionMatch | ActionTournament | ActionNavigate
