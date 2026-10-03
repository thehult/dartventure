import { describe, expect, it } from 'vitest'
import {
  advanceStory,
  describeMatchResult,
  isActionEnabled,
  isActionVisible,
  leaveTournament,
  performAction,
  repair,
  resolveMatch,
  setDifficulty,
  setPlayerName,
  settle,
  startPractice,
  startTournamentMatch,
  tournamentSummary,
} from './flow'
import { createGameState } from './save'
import type { GameState } from '@/types/GameState'
import type { Action } from '@/types/Scene'
import { PLAYER_ID } from '@/types/Player'
import { getScene } from '@/scenes'

const action = (sceneId: string, name: string): Action => {
  const found = getScene(sceneId).actions.find((a) => a.name === name)
  if (!found) throw new Error(`No action "${name}"`)
  return found
}

/** Clicks through every story that is playing. */
const skipStories = (state: GameState) => {
  while (state.activity?.type === 'story') state = advanceStory(state)
  return state
}

const newGame = () => skipStories(settle(createGameState('Phil')))

/** In the pub with 20 reputation, $20 and the tournament invite. */
const inPubWithInvite = () => {
  const state = skipStories(performAction(newGame(), action('world', 'The Pub')))
  return {
    ...skipStories(settle({ ...state, reputation: 20 })),
    money: 20,
    // Skip Lou's side bet.
    completedStories: [...state.completedStories, 'pub-tournament-invite', 'lous-bet'],
  }
}

describe('game flow', () => {
  it('plays the intro, then lets the player act', () => {
    const state = settle(createGameState('Phil'))
    expect(state.activity).toMatchObject({ type: 'story', story: 'intro' })
    expect(skipStories(state).activity).toBeNull()
  })

  it('plays the pub stories on entering the pub', () => {
    let state = performAction(newGame(), action('world', 'The Pub'))
    expect(state.location).toBe('pub')
    expect(state.activity).toMatchObject({ type: 'story', story: 'welcome' })
    state = skipStories(state)
    expect(state.completedStories).toEqual(['intro', 'welcome', 'first-chump'])
  })

  it('ignores actions while something else is going on', () => {
    const state = settle(createGameState('Phil'))
    expect(performAction(state, action('world', 'The Pub'))).toBe(state)
  })

  it('applies the reward of a won match and counts stats', () => {
    let state = skipStories(performAction(newGame(), action('world', 'The Pub')))
    state = performAction(state, action('pub', 'Play a chump'))
    expect(state.activity?.type).toBe('match')
    expect(describeMatchResult(state, true).text).toBe(
      '**+$5** and **+5** *reputation*!',
    )

    state = resolveMatch(state, { won: true, average: 70 })
    expect(state.activity).toBeNull()
    expect(state.reputation).toBe(5)
    expect(state.money).toBe(5)
    expect(state.stats).toMatchObject({ matchesPlayed: 1, matchesWon: 1 })
    expect(state.playerAverage).toBe(54)
  })

  it('sets the opponent average relative to the player', () => {
    let state = skipStories(performAction(newGame(), action('world', 'The Pub')))
    state = { ...state, playerAverage: 70 }
    state = performAction(state, action('pub', 'Play a chump'))
    if (state.activity?.type !== 'match') throw new Error('No match')
    expect(state.activity.match.players[1].average).toBe(50)
  })

  it('matches opponents to the difficulty', () => {
    let state = skipStories(performAction(newGame(), action('world', 'The Pub')))
    state = { ...state, playerAverage: 70, difficulty: 'pro' }
    state = performAction(state, action('pub', 'Play a chump'))
    if (state.activity?.type !== 'match') throw new Error('No match')
    expect(state.activity.match.players[1].average).toBe(55)
  })

  it('keeps opponents above their minimum average', () => {
    let state = { ...inPubWithInvite(), playerAverage: 20 }
    state = performAction(state, action('pub', 'Back home'))
    state = skipStories(settle({ ...state, completedStories: [...state.completedStories, 'club-invite'] }))
    state = skipStories(performAction(state, action('world', 'The Club')))
    state = performAction(state, action('club', 'League night'))
    if (state.activity?.type !== 'match') throw new Error('No match')
    expect(state.activity.match.players[1].average).toBe(30)
  })

  it('invites the player to the tournament at 20 reputation', () => {
    let state = skipStories(performAction(newGame(), action('world', 'The Pub')))
    const tournament = action('pub', 'Pub tournament')
    expect(isActionVisible(tournament, state)).toBe(false)

    state = settle({ ...state, reputation: 20 })
    expect(state.activity).toMatchObject({ story: 'pub-tournament-invite' })
    state = skipStories(state)
    expect(isActionVisible(tournament, state)).toBe(true)
  })

  it('charges the entry fee and refuses players who cannot pay', () => {
    const state = inPubWithInvite()
    const tournament = action('pub', 'Pub tournament')
    expect(isActionEnabled(tournament, { ...state, money: 9 })).toBe(false)
    expect(performAction({ ...state, money: 9 }, tournament).activity).toBeNull()
    const entered = performAction(state, tournament)
    expect(entered.activity?.type).toBe('tournament')
    expect(entered.money).toBe(state.money - 10)
  })

  it('plays a whole tournament', () => {
    let state = performAction(inPubWithInvite(), action('pub', 'Pub tournament'))

    for (let round = 1; round <= 3; round++) {
      expect(tournamentSummary(state)?.status).toBe('playing')
      state = startTournamentMatch(state)
      if (state.activity?.type !== 'tournament') throw new Error('Left')
      expect(state.activity.match?.players[0].id).toBe(PLAYER_ID)
      state = resolveMatch(state, { won: true })
    }

    const summary = tournamentSummary(state)!
    expect(summary.status).toBe('champion')
    expect(summary.finished).toBe(true)
    // Three round rewards plus the champion's reward.
    expect(summary.outcome).toMatchObject({ reputation: 16, money: 55 })
    state = leaveTournament(state)
    expect(state.reputation).toBe(36)
    expect(state.money).toBe(20 - 10 + 55)
    expect(state.flags.pubChampion).toBe(true)
    expect(state.stats).toMatchObject({
      matchesWon: 3,
      tournamentsPlayed: 1,
      tournamentsWon: 1,
    })
    // Winning unlocks the club.
    expect(state.activity).toMatchObject({ story: 'club-invite' })
  })

  it('finishes the bracket when the player is knocked out', () => {
    let state = performAction(inPubWithInvite(), action('pub', 'Pub tournament'))
    state = resolveMatch(startTournamentMatch(state), { won: false })

    const summary = tournamentSummary(state)!
    expect(summary.status).toBe('eliminated')
    expect(summary.finished).toBe(true)
    expect(summary.champion?.id).not.toBe(PLAYER_ID)
    expect(leaveTournament(state).reputation).toBe(20)
  })
})

describe('repair', () => {
  it('drops references to content that no longer exists', () => {
    const state = repair({
      ...createGameState('Phil'),
      completedStories: ['intro'],
      location: 'deleted-scene',
      activity: {
        type: 'story',
        sceneId: 'pub',
        story: 'deleted-story',
        pc: 0,
        character: null,
      },
    })
    expect(state.location).toBe('world')
    expect(state.activity).toBeNull()
  })

  describe('practice', () => {
    const practice = (state: GameState, opponentAverage = 40) =>
      startPractice(state, {
        gameId: 'x01',
        gameOptions: { startingScore: 301, checkoutRule: 'double-out' },
        opponentAverage,
      })

    it('plays a bot at the chosen average, ignoring difficulty', () => {
      const state = practice({ ...newGame(), difficulty: 'pro' }, 40)
      if (state.activity?.type !== 'match') throw new Error('No match')
      expect(state.activity.match).toMatchObject({ practice: true })
      expect(state.activity.match.players[1].average).toBe(40)
    })

    it('has no stakes and leaves stats and average alone', () => {
      const before = newGame()
      let state = practice(before)
      expect(describeMatchResult(state, true).text).toBe('Nice practice!')
      state = resolveMatch(state, { won: true, average: 100 })
      expect(state.activity).toBeNull()
      expect(state).toEqual(before)
    })

    it('cannot start while something else is going on', () => {
      const state = settle(createGameState('Phil'))
      expect(practice(state)).toBe(state)
    })
  })

  it('changes difficulty and name, keeping the old ones for blank names', () => {
    const state = newGame()
    expect(setDifficulty(state, 'hard').difficulty).toBe('hard')
    expect(setPlayerName(state, '  Bob ').playerName).toBe('Bob')
    expect(setPlayerName(state, '   ')).toBe(state)
  })

  it('opens panels without changing the game', () => {
    const state = newGame()
    expect(performAction(state, action('world', 'Stats'))).toBe(state)
  })
})
