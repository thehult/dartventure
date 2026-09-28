import type { GameState } from '@/types/GameState'
import type { Outcome } from '@/types/Outcome'

export const applyOutcome = (
  state: GameState,
  outcome: Outcome | undefined,
): GameState => {
  if (!outcome) return state
  return {
    ...state,
    money: Math.max(state.money + (outcome.money ?? 0), 0),
    reputation: Math.max(state.reputation + (outcome.reputation ?? 0), 0),
    flags: { ...state.flags, ...outcome.flags },
  }
}

const signed = (value: number) => (value < 0 ? '-' : '+')

/** Markdown description of an outcome, e.g. "**+$10** and **-5** *reputation*!" */
export const formatOutcome = (outcome: Outcome | undefined): string => {
  const parts: Array<string> = []
  if (outcome?.money) {
    parts.push(`**${signed(outcome.money)}$${Math.abs(outcome.money)}**`)
  }
  if (outcome?.reputation) {
    parts.push(
      `**${signed(outcome.reputation)}${Math.abs(outcome.reputation)}** *reputation*`,
    )
  }
  return parts.length > 0 ? parts.join(' and ') + '!' : ''
}
