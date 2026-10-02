type GameComponentProps = {
  localPlayerId: string
}

/** Renders a game inside a `DartGameProvider`. */
export type GameComponent = React.FC<GameComponentProps>
