import { useEffect, useMemo, useState } from 'react'
import {
  DartGameProvider,
  useBot,
  useGameContext,
} from '@thehult/dartgames-react'
import { createThrower, modelFromAverage } from '@thehult/dartgames-simulation'
import type { GamePersistenceAdapter } from '@thehult/dartgames-react'
import type { BaseGameState } from '@thehult/dartgames-core'
import type { ActiveMatch, MatchResult } from '@/types/Match'
import type { GameState } from '@/types/GameState'
import { Background } from '@/components/Background'
import { Dialogue } from '@/components/Dialogue'
import { getGame, getGameComponent, getGameConfig } from '@/games/registry'
import { describeMatchResult } from '@/engine/flow'
import { getScene } from '@/scenes'
import { actions } from '@/state/actions'
import { PLAYER_ID } from '@/types/Player'

/** Milliseconds between the bot's turns. */
const BOT_DELAY = 800

/** Plays one match. Mount with `key={match.id}` so each match gets a new game. */
export function MatchScreen({
  state,
  match,
}: {
  state: GameState
  match: ActiveMatch
}) {
  const definition = getGame(match.gameId)
  // The game is saved in the match itself, and so in the player's save.
  const adapter = useMemo<GamePersistenceAdapter>(() => {
    const stored = match.gameData
    return {
      // A game saved by an older version has another shape: start over.
      load: () => (stored && 'log' in stored ? stored : null),
      save: (id, snapshot) => actions.saveMatchProgress(id, snapshot),
    }
    // Only the match this screen was mounted with is resumed.
  }, [match.id])

  return (
    <Background background={getScene(state.location).background}>
      <DartGameProvider
        game={definition.game}
        options={{
          config: getGameConfig(match.gameId, match.gameOptions),
          players: match.players.map((p) => ({ id: p.id, name: p.name })),
        }}
        config={{ persistence: { id: match.id, adapter } }}
      >
        <MatchView state={state} match={match} />
      </DartGameProvider>
    </Background>
  )
}

function MatchView({ state, match }: { state: GameState; match: ActiveMatch }) {
  const definition = getGame(match.gameId)
  const game = useGameContext<BaseGameState>()
  const opponent = match.players[1]
  const [result, setResult] = useState<MatchResult | null>(null)

  const strategy = useMemo(
    () => definition.createStrategy(opponent.average),
    [definition, opponent.average],
  )
  const throwDart = useMemo(
    () => createThrower(modelFromAverage(opponent.average)),
    [opponent.average],
  )
  useBot(game, strategy, {
    players: [opponent.id],
    delayMs: BOT_DELAY,
    throwDart,
    enabled: !result,
  })

  // The match is decided as soon as one player has finished.
  const winnerId = game.state.players.find((p) => p.finishPosition === 1)?.id
  useEffect(() => {
    if (!winnerId || result) return
    setResult({
      won: winnerId === PLAYER_ID,
      average: definition.measureAverage?.(game.history, game.state, PLAYER_ID),
    })
  }, [winnerId])

  const GameView = getGameComponent(match.gameId, state.location)
  const summary = result ? describeMatchResult(state, result.won) : null

  return (
    <>
      {!game.isHydrating && (
        <div className="flex flex-col items-center justify-start mx-auto w-full lg:w-4/5 xl:w-3/5 h-full p-2 sm:p-4">
          <GameView localPlayerId={PLAYER_ID} />
        </div>
      )}
      {result && summary && (
        <Dialogue
          visible={true}
          speaker={summary.title}
          onContinue={() => actions.resolveMatch(result)}
        >
          {summary.text}
        </Dialogue>
      )}
    </>
  )
}
