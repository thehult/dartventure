'use strict'

import { Background } from '@/components/Background'
import { createFileRoute, type ReactNode } from '@tanstack/react-router'
import { GameBot, GameProvider } from '@dartgames/react'
import X01Pub from '@/games/X01/X01Pub'
import type { SceneId } from '@/scenes/scenes'
import { useMemo, useRef, useState } from 'react'
import { Field, type IPlayer } from '@dartgames/core'
import type { Opponent } from '@/types/Player'
import { useGameSave } from '@/hooks/useGameSave'
import type { GameId, Outcome } from '@/types/Actions'
import { Dialogue } from '@/components/Dialogue'
import ClickAnywhere from '@/components/ClickAnywhere'
import { useScene } from '@/hooks/useScene'
import { useGameFlow } from '@/hooks/useGameFlow'
import { OPPONENT_ID, PLAYER_ID, useMatch } from '@/hooks/useMatch'
import { createGameStrategy } from '@/util/games'
import { useDartGame } from '@/hooks/useDartGame'

const gameComponents: Record<GameId, Record<SceneId, ReactNode>> = {
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
  const { match, gameId, initialGameData, players, saveGameData } = useMatch()
  const { goToScene } = useGameFlow()

  const opponent = useMemo(() => {
    return players.find((p) => p.id !== PLAYER_ID) as Opponent
  }, [players])

  const GameComponent = gameComponents[gameId][sceneId]
  const game = useDartGame(gameId, players, match.gameOptions, initialGameData)
  const gameStrategy = useRef(createGameStrategy(gameId))

  const handleBotHit = (hit: Field) => {
    console.log('Bot hit', hit)
  }

  const handleGameOver = (winners: IPlayer[]) => {
    if (winners.some((p) => p.id === PLAYER_ID)) {
      setMatchState('won')
      addMoney(match.reward?.money ?? 0)
      addReputation(match.reward?.reputation ?? 0)
    } else {
      setMatchState('lost')
      addMoney(match.penalty?.money ?? 0)
      addReputation(match.penalty?.reputation ?? 0)
    }
  }

  const handleStateChange = (gameState: any) => {
    saveGameData(gameState)
  }

  const handleNavigateBack = () => {
    goToScene(sceneId)
  }

  console.log(game)

  return (
    <Background background={scene.background}>
      <GameProvider
        game={game}
        onStateChange={handleStateChange}
        onGameOver={handleGameOver}
      >
        {/* @ts-ignore */}
        <GameBot
          playerId={OPPONENT_ID}
          average={opponent?.average ?? 50}
          strategy={gameStrategy.current}
          delay={20}
          onHit={handleBotHit}
        />
        <div className="flex flex-col items-center justify-start justify-self-center w-full lg:w-4/5 xl:w-3/5 h-full p-4">
          <GameComponent localPlayerId={PLAYER_ID} />
        </div>
      </GameProvider>
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
