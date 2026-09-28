import { useState } from 'react'
import { GameProvider } from '@dartgames/react'
import type { IPlayer } from '@dartgames/core'
import type { ActiveMatch, MatchResult } from '@/types/Match'
import type { GameState } from '@/types/GameState'
import { Background } from '@/components/Background'
import { Dialogue } from '@/components/Dialogue'
import { MatchBot } from '@/components/MatchBot'
import { getGame, getGameComponent } from '@/games/registry'
import { describeMatchResult } from '@/engine/flow'
import { getScene } from '@/scenes'
import { actions } from '@/state/actions'
import { PLAYER_ID } from '@/types/Player'

/** Milliseconds between the bot's darts. */
const BOT_DELAY = 20

/** Plays one match. Mount with `key={match.id}` so each match gets a new game. */
export function MatchScreen({
  state,
  match,
}: {
  state: GameState
  match: ActiveMatch
}) {
  const definition = getGame(match.gameId)
  const [game] = useState(() =>
    match.gameData
      ? definition.load(match.gameData)
      : definition.create(match.players, match.gameOptions),
  )
  const [strategy] = useState(() => definition.createStrategy())
  const [result, setResult] = useState<MatchResult | null>(null)

  const GameView = getGameComponent(match.gameId, state.location)
  const opponent = match.players[1]

  const handleGameOver = (winners: Array<IPlayer>) => {
    setResult({
      won: winners.some((p) => p.id === PLAYER_ID),
      average: definition.measureAverage?.(game, PLAYER_ID),
    })
  }

  const summary = result ? describeMatchResult(state, result.won) : null

  return (
    <Background background={getScene(state.location).background}>
      <GameProvider
        game={game}
        onStateChange={() => actions.saveMatchProgress(match.id, game.toJson())}
        onGameOver={handleGameOver}
      >
        <MatchBot
          playerId={opponent.id}
          average={opponent.average}
          strategy={strategy}
          delay={BOT_DELAY}
        />
        <div className="flex flex-col items-center justify-start mx-auto w-full lg:w-4/5 xl:w-3/5 h-full p-2 sm:p-4">
          <GameView localPlayerId={PLAYER_ID} />
        </div>
      </GameProvider>
      {result && summary && (
        <Dialogue
          visible={true}
          speaker={summary.title}
          onContinue={() => actions.resolveMatch(result)}
        >
          {summary.text}
        </Dialogue>
      )}
    </Background>
  )
}
