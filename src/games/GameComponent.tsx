import type { IInput, PlayerId } from '@dartgames/core'

type GameComponentProps = {
  localPlayerId: PlayerId
  onRequestInput?: (player: PlayerId) => IInput
  onGameOver?: (playerWon: boolean) => void
}

export interface GameComponent extends React.FC<GameComponentProps> {}
