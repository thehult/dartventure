/**
 * Plays the whole campaign automatically, to check the pacing of the content.
 * Used by `pacing.test.ts`; run it with `npm test -- pacing` and read the
 * printed table when tuning rewards and gates.
 */
import type { GameState } from '@/types/GameState'
import type { Action } from '@/types/Scene'
import {
  activeMatch,
  advanceStory,
  isActionEnabled,
  isActionVisible,
  leaveTournament,
  performAction,
  resolveMatch,
  settle,
  startTournamentMatch,
  tournamentSummary,
} from '@/engine/flow'
import { createGameState } from '@/engine/save'
import { getScene } from '@/scenes'

/** Flags that mark progress through the campaign, in order. */
export const MILESTONES = [
  'pubChampion',
  'clubChampion',
  'districtChampion',
  'nationalChampion',
  'worldChampion',
] as const

export type CampaignResult = {
  finished: boolean
  /** Matches the player played. */
  matches: number
  /** Matches played when each milestone was reached. */
  milestones: Partial<Record<(typeof MILESTONES)[number], number>>
  tournamentsPlayed: number
  /** Times the player couldn't afford anything and went back to the pub. */
  timesBroke: number
  finalState: GameState
}

/**
 * Chance of beating an opponent in one leg, from the difference in averages.
 * A 10 point advantage wins about 78% of legs.
 */
export const winChance = (playerAverage: number, opponentAverage: number) =>
  1 / (1 + Math.exp(-(playerAverage - opponentAverage) / 8))

/** Money to save up at the pub before going back after going broke. */
const GRIND_UNTIL = 60

export const playCampaign = (
  playerAverage: number,
  random: () => number,
  wins: 'always' | 'model' = 'model',
  maxMatches = 3000,
): CampaignResult => {
  let state = settle({ ...createGameState('Sim'), playerAverage })
  const result: CampaignResult = {
    finished: false,
    matches: 0,
    milestones: {},
    tournamentsPlayed: 0,
    timesBroke: 0,
    finalState: state,
  }
  let grinding = false

  const perform = (action: Action | undefined) => {
    if (!action) throw new Error(`Stuck in ${state.location}`)
    state = performAction(state, action)
  }
  const available = () =>
    getScene(state.location).actions.filter(
      (a) => isActionVisible(a, state) && isActionEnabled(a, state),
    )
  const navigateTo = (sceneId: string) =>
    available().find((a) => a.action === 'navigate' && a.sceneId === sceneId)
  /** The most advanced venue unlocked on the map. */
  const furthestVenue = () => {
    const venues = getScene('world').actions.filter(
      (a) => a.action === 'navigate' && isActionVisible(a, state),
    )
    const last = venues[venues.length - 1]
    return last.action === 'navigate' ? last.sceneId : 'pub'
  }

  while (result.matches < maxMatches) {
    for (const flag of MILESTONES) {
      if (state.flags[flag] && result.milestones[flag] === undefined) {
        result.milestones[flag] = result.matches
      }
    }
    if (state.flags.worldChampion && state.activity === null) {
      result.finished = true
      break
    }

    const activity = state.activity
    if (activity?.type === 'story') {
      // Accept every challenge and bet: always pick the first choice.
      const next = advanceStory(state)
      state = next === state ? advanceStory(state, 0) : next
      continue
    }
    const match = activeMatch(state)
    if (match) {
      result.matches++
      const won =
        wins === 'always' ||
        random() < winChance(playerAverage, match.players[1].average)
      state = resolveMatch(state, { won })
      continue
    }
    if (activity?.type === 'tournament') {
      state =
        tournamentSummary(state)?.status === 'playing'
          ? startTournamentMatch(state)
          : leaveTournament(state)
      continue
    }

    // Free to act.
    const target = grinding ? 'pub' : furthestVenue()
    if (state.location !== target) {
      perform(navigateTo(state.location === 'world' ? target : 'world'))
      continue
    }
    const tournament = available().find((a) => a.action === 'tournament')
    const single = available().find((a) => a.action === 'match')
    if (grinding && state.money >= GRIND_UNTIL) {
      grinding = false
    } else if (tournament && !grinding) {
      result.tournamentsPlayed++
      perform(tournament)
    } else if (single) {
      perform(single)
    } else {
      result.timesBroke++
      grinding = true
    }
  }

  result.finalState = state
  return result
}
