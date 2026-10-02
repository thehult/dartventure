import type { BaseGameState } from '@thehult/dartgames-core'
import type { UseDartGameResult } from '@thehult/dartgames-react'

export type GameHandle<TState extends BaseGameState = any, TConfig = any, TInput = any, TResult = any> =
  UseDartGameResult<TState, TConfig, TInput, TResult>

type GameComponentProps = {
  game: GameHandle
  localPlayerId: string
}

export interface GameComponent extends React.FC<GameComponentProps> {}
