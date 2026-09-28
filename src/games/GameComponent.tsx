import type { PlayerId } from '@dartgames/core'

type GameComponentProps = {
  localPlayerId: PlayerId
}

/** Renders a game inside a `GameProvider`. */
export type GameComponent = React.FC<GameComponentProps>
