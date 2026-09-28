import { useEffect } from 'react'
import { ScoreInput } from '@dartgames/core'
import { useBot, useGame } from '@dartgames/react'
import type { Field, IGameStrategy, PlayerId } from '@dartgames/core'

type MatchBotProps = {
  playerId: PlayerId
  average: number
  strategy: IGameStrategy<any>
  /** Milliseconds between darts. */
  delay?: number
  onHit?: (hit: Field) => void
}

/**
 * Throws for a bot player. Like `GameBot` from @dartgames/react, but cancels
 * its pending throws when the state changes or it unmounts, so a turn can't
 * be submitted twice (e.g. under StrictMode).
 */
export const MatchBot = ({
  playerId,
  average,
  strategy,
  delay = 400,
  onHit,
}: MatchBotProps) => {
  const { game, state, submitInput, previewInput } = useGame()
  const { throwDarts } = useBot(average, strategy)

  useEffect(() => {
    if (game.isGameOver(state)) return
    const player = game.getCurrentPlayer()
    if (player.id !== playerId) return

    const hits = throwDarts(game, player, 3)
    const timeouts = hits.map((hit, i) =>
      setTimeout(
        () => {
          previewInput(new ScoreInput(hits.slice(0, i + 1)))
          onHit?.(hit)
        },
        (i + 1) * delay,
      ),
    )
    timeouts.push(
      setTimeout(
        () =>
          submitInput(
            hits.length > 0 ? new ScoreInput(hits) : new ScoreInput(0),
          ),
        (hits.length + 1) * delay,
      ),
    )
    return () => timeouts.forEach(clearTimeout)
    // Throw once per state; the callbacks don't need to retrigger a turn.
  }, [game, state, playerId])

  return null
}
