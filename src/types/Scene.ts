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

export type Action = {
  name: string
  icon: string
  description: string
  action: string
  parameters?: { [key: string]: any }
  requirements?: Requirement[]
  unlocked_by?: string
}
