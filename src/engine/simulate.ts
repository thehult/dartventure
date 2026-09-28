import { createBotFromAverage, simulatePlayerThrows } from '@dartgames/bots'
import { Field, ScoreInput } from '@dartgames/core'
import type { PlayerId } from '@dartgames/core'
import type { GameOptions } from '@/types/Match'
import type { BotPlayer } from '@/types/Player'
import { getGame } from '@/games/registry'

const MAX_TURNS = 300

/** Plays a whole game between bots, without a UI. Returns the winner's id. */
export const simulateMatch = (
  gameId: string,
  gameOptions: GameOptions | undefined,
  players: Array<BotPlayer>,
): PlayerId => {
  const definition = getGame(gameId)
  const game = definition.create(players, gameOptions)
  const strategy = definition.createStrategy()
  const bots = new Map(
    players.map((p) => [p.id, createBotFromAverage(p.average)]),
  )

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    if (game.isGameOver(game.state)) break
    const player = game.getCurrentPlayer()
    const bot = bots.get(player.id)!
    const targets = strategy.getStrategy(game.state, game.options, player)
    const hits = targets
      .slice(0, 3)
      .map((target) =>
        Field.fromHitPoint(simulatePlayerThrows(bot, target, 1)[0]),
      )
    game.submitInput(hits.length > 0 ? new ScoreInput(hits) : new ScoreInput(0))
  }

  const winner = game.getWinners(game.state)?.[0]
  if (winner) return winner.id
  // Nobody finished in time: the stronger player takes it.
  return [...players].sort((a, b) => b.average - a.average)[0].id
}
