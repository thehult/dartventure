import { Background } from '@/components/Background'
import { createFileRoute } from '@tanstack/react-router'
import { useBot, useDartGame } from '@thehult/dartgames-react'
import type { X01State } from '@thehult/dartgames-games/x01'
import X01Pub from '@/games/X01/X01Pub'
import type { GameComponent } from '@/games/GameComponent'
import type { SceneId } from '@/scenes/scenes'
import { useEffect, useMemo, useState } from 'react'
import type { Opponent } from '@/types/Player'
import { useGameSave } from '@/hooks/useGameSave'
import type { GameId, Outcome } from '@/types/Actions'
import { Dialogue } from '@/components/Dialogue'
import ClickAnywhere from '@/components/ClickAnywhere'
import { useScene } from '@/hooks/useScene'
import { useGameFlow } from '@/hooks/useGameFlow'
import { OPPONENT_ID, PLAYER_ID, useMatch } from '@/hooks/useMatch'
import { createGameStrategy, createGameThrower } from '@/util/strategy'
import { getGame } from '@/util/games'
import { matchAdapter } from '@/util/persistence'

const gameComponents: Record<GameId, Record<SceneId, GameComponent>> = {
  x01: {
    pub: X01Pub,
    world: X01Pub,
  },
}
export const Route = createFileRoute('/game/match')({
  component: MatchComponent,
})

function MatchComponent() {
  const [matchState, setMatchState] = useState<'running' | 'won' | 'lost'>(
    'running',
  )

  const { scene, sceneId } = useScene()
  const { addMoney, addReputation } = useGameSave()
  const { match, gameId, players } = useMatch()
  const { goToScene } = useGameFlow()

  const opponent = useMemo(() => {
    return players.find((p) => p.id !== PLAYER_ID) as Opponent
  }, [players])

  const GameComponent = gameComponents[gameId][sceneId]
  const game = useDartGame(
    getGame(gameId),
    { config: match.gameOptions as any, players },
    { persistence: { id: match.id, adapter: matchAdapter } },
  )
  const strategy = useMemo(
    () => createGameStrategy(gameId, opponent?.average ?? 50),
    [gameId, opponent],
  )
  const throwDart = useMemo(
    () => createGameThrower(opponent?.average ?? 50),
    [opponent],
  )
  useBot(game, strategy, {
    players: [OPPONENT_ID],
    delayMs: 800,
    throwDart,
    enabled: matchState === 'running',
  })

  // The match is decided as soon as one player has checked out.
  const winnerId = (game.state as X01State).players.find(
    (p) => p.finishPosition === 1,
  )?.id
  useEffect(() => {
    if (!winnerId || matchState !== 'running') return
    if (winnerId === PLAYER_ID) {
      setMatchState('won')
      addMoney(match.reward?.money ?? 0)
      addReputation(match.reward?.reputation ?? 0)
    } else {
      setMatchState('lost')
      addMoney(match.penalty?.money ?? 0)
      addReputation(match.penalty?.reputation ?? 0)
    }
  }, [winnerId])

  const handleNavigateBack = () => {
    goToScene(sceneId)
  }

  return (
    <Background background={scene.background}>
      {!game.isHydrating && (
        <div className="flex flex-col items-center justify-start justify-self-center w-full lg:w-4/5 xl:w-3/5 h-full p-4">
          <GameComponent game={game} localPlayerId={PLAYER_ID} />
        </div>
      )}
      {matchState === 'won' && (
        <ClickAnywhere onClick={handleNavigateBack}>
          <Dialogue visible={true} speaker="You won!">
            {createOutcomeString(match.reward)}
          </Dialogue>
        </ClickAnywhere>
      )}
      {matchState === 'lost' && (
        <ClickAnywhere onClick={handleNavigateBack}>
          <Dialogue visible={true} speaker="You lost!">
            {createOutcomeString(match.penalty)}
          </Dialogue>
        </ClickAnywhere>
      )}
    </Background>
  )
}

const createOutcomeString = (outcome?: Outcome) => {
  if (typeof outcome === 'undefined') return ''
  console.log('Outcome', outcome)

  let moneySign = (outcome?.money ?? 0) > 0 ? '+' : '-'
  let reputationSign = (outcome?.reputation ?? 0) > 0 ? '+' : '-'
  let os = ''
  os += outcome?.money ? `**${moneySign}$${Math.abs(outcome?.money)}**` : ''
  os += outcome?.money && outcome?.reputation ? ' and ' : ''
  os += outcome?.reputation
    ? `**${reputationSign}${Math.abs(outcome?.reputation)}** *reputation*`
    : ''
  os += '!'
  return os
}
