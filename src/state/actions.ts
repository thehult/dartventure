import { update } from './store'
import type { IGame, IGameData } from '@dartgames/core'
import type { Action } from '@/types/Scene'
import type { MatchResult } from '@/types/Match'
import type { Outcome } from '@/types/Outcome'
import type { Difficulty } from '@/engine/difficulty'
import { applyOutcome } from '@/engine/outcome'
import * as flow from '@/engine/flow'

/** Everything the UI can do to the game. */
export const actions = {
  perform: (action: Action) => update((s) => flow.performAction(s, action)),
  advanceStory: (choice?: number) =>
    update((s) => flow.advanceStory(s, choice)),
  saveMatchProgress: (matchId: string, gameData: IGameData<IGame>) =>
    update((s) => flow.saveMatchProgress(s, matchId, gameData)),
  resolveMatch: (result: MatchResult) =>
    update((s) => flow.resolveMatch(s, result)),
  startTournamentMatch: () => update(flow.startTournamentMatch),
  leaveTournament: () => update(flow.leaveTournament),
  setDifficulty: (difficulty: Difficulty) =>
    update((s) => flow.setDifficulty(s, difficulty)),
  /** Development cheat. */
  give: (outcome: Outcome) =>
    update((s) => flow.settle(applyOutcome(s, outcome))),
}
