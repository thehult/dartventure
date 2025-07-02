import type { SceneId } from '@/scenes/scenes'
import type { Opponent } from './Opponent'

export interface Scene {
  background: Background
  characters: { [id: string]: Character }
  actions: Action[]
  stories: Story[]
}

export type Background = string

export type Character = {
  name: string
  image: string
}

type RequirementReputation = { reputation: number }
type RequirementStory = { story: string }
export type Requirement = RequirementReputation | RequirementStory

type ScriptCharacter = { character: string }
type ScriptDialogue = { dialogue: string }
export type ScriptAction = ScriptCharacter | ScriptDialogue

export type Story = {
  name: string
  requirements?: Requirement[]
  script: ScriptAction[]
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
  gameId: string
  gameParameters?: { [key: string]: any }
  opponent: Opponent
  reward?: { money?: number; reputation?: number }
  penalty?: { money?: number; reputation?: number }
}
type ActionTournament = ActionBase & {
  action: 'tournament'
  gameId: string
  gameParameters?: { [key: string]: any }
}
type ActionNavigate = ActionBase & {
  action: 'navigate'
  sceneId: SceneId
}
export type Action = ActionMatch | ActionTournament | ActionNavigate
