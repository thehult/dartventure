'use strict'

import { Background } from '@/components/Background'
import { useScene } from '@/components/GameContext'
import { createFileRoute, type ReactNode } from '@tanstack/react-router'
import { GameBot, GameProvider } from '@dartgames/react'
import { X01, X01BasicStrategy, type X01Options } from '@dartgames/games'
import X01Pub from '@/games/X01/X01Pub'
import type { SceneId } from '@/scenes/scenes'
import { useMemo, useState } from 'react'
import {
  Field,
  type IGame,
  type IGameStrategy,
  type IPlayer,
} from '@dartgames/core'
import { type GameComponent } from '@/games/GameComponent'
import type { DartPlayer } from '@/types/Player'
import { useGameSave } from '@/components/useGameSave'
import { randomMaleName } from '@/util/names'
import type { GameId, Opponent, Outcome } from '@/types/Actions'
import { Dialogue } from '@/components/Dialogue'
import ClickAnywhere from '@/components/ClickAnywhere'

const PLAYER_ID = 'player'
const OPPONENT_ID = 'opponent'

const gameComponents: Record<GameId, Record<SceneId, ReactNode>> = {
  x01: {
    pub: X01Pub,
    world: X01Pub,
  },
}

type MatchOptions = {
  gameId: GameId
  opponent: Opponent
  options?: Record<string, any>
  reward?: Outcome
  penalty?: Outcome
}

export const Route = createFileRoute('/game/match')({
  component: MatchComponent,
  validateSearch: (search): MatchOptions => {
    return {
      gameId: (search.gameId as GameId) ?? 'error',
      opponent: search.opponent as Opponent,
      options: (search.options as Record<string, any>) ?? {},
      reward: search.reward as Outcome,
      penalty: search.penalty as Outcome,
    }
  },
})

function MatchComponent() {
  const [matchState, setMatchState] = useState<'running' | 'won' | 'lost'>(
    'running',
  )

  const { playerName, playerAverage, addMoney, addReputation } = useGameSave()
  const { gameId, opponent, options, reward, penalty } = Route.useSearch()
  const { scene, sceneId, navigateToScene } = useScene()
  const players = useMemo<DartPlayer[]>(
    () => [
      {
        id: PLAYER_ID,
        name: playerName,
      },
      {
        id: OPPONENT_ID,
        name: opponent.name ?? randomMaleName(),
      },
    ],
    [opponent],
  )

  const opponentAverage = Math.max(
    15,
    Math.min(110, playerAverage + opponent.average),
  )

  const game = useMemo<IGame>(() => {
    switch (gameId) {
      case 'x01':
        return new X01(players, options as X01Options)
    }
  }, [gameId])

  const gameStrategy = useMemo<IGameStrategy<any>>(() => {
    switch (gameId) {
      case 'x01':
        return new X01BasicStrategy()
    }
  }, [gameId])

  const GameComponent = useMemo<GameComponent>(
    () => gameComponents[gameId][sceneId],
    [gameId, sceneId],
  )

  const handleBotHit = (hit: Field) => {
    console.log('Bot hit', hit)
  }

  const handleGameOver = (winners: IPlayer[]) => {
    if (winners.some((p) => p.id === PLAYER_ID)) {
      setMatchState('won')
      addMoney(reward?.money ?? 0)
      addReputation(reward?.reputation ?? 0)
    } else {
      setMatchState('lost')
      addMoney(penalty?.money ?? 0)
      addReputation(penalty?.reputation ?? 0)
    }
  }

  const handleNavigateBack = () => {
    navigateToScene(sceneId)
  }

  return (
    <Background background={scene.background}>
      <GameProvider game={game} onGameOver={handleGameOver}>
        {/* @ts-ignore */}
        <GameBot
          playerId={OPPONENT_ID}
          average={opponentAverage}
          strategy={gameStrategy}
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
            {createOutcomeString(reward)}
          </Dialogue>
        </ClickAnywhere>
      )}
      {matchState === 'lost' && (
        <ClickAnywhere onClick={handleNavigateBack}>
          <Dialogue visible={true} speaker="You lost!">
            {createOutcomeString(penalty)}
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
