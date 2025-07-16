import type { Requirement } from './Requirement'
import type { Action } from './Actions'

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

type ScriptCharacter = { character: string }
type ScriptDialogue = { dialogue: string }
export type ScriptAction = ScriptCharacter | ScriptDialogue

export type Story = {
  name: string
  requirements?: Requirement[]
  script: ScriptAction[]
}
