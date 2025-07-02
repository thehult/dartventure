import type { GameSave } from '@/types/GameSave'
import { Jexl } from 'jexl'

export const evaluateRequirement = (requirement: string, context: GameSave) => {
  const jexl = new Jexl()

  jexl.addFunction('hasTag', (tag: string) => context.tags.includes(tag))
  jexl.addFunction('noTag', (tag: string) => !context.tags.includes(tag))
  jexl.addFunction('isUnlocked', (tag: string) => context.unlocks.includes(tag))

  return jexl.evalSync(requirement, context)
}
