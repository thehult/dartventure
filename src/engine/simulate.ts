import { createSession, playStrategyTurn } from '@thehult/dartgames-core'
import { createThrower, modelFromAverage } from '@thehult/dartgames-simulation'
import type { GameOptions } from '@/types/Match'
import type { BotPlayer } from '@/types/Player'
import { getGame, getGameConfig } from '@/games/registry'

const MAX_TURNS = 300

/** Fitting a model to an average is slow, and averages are whole numbers. */
const models = new Map<number, ReturnType<typeof modelFromAverage>>()
const modelFor = (average: number) => {
  let model = models.get(average)
  if (!model) {
    model = modelFromAverage(average)
    models.set(average, model)
  }
  return model
}

/** Plays a whole game between bots, without a UI. Returns the winner's id. */
export const simulateMatch = (
  gameId: string,
  gameOptions: GameOptions | undefined,
  players: Array<BotPlayer>,
): string => {
  const definition = getGame(gameId)
  const { game } = definition
  let session = createSession(game, {
    config: getGameConfig(gameId, gameOptions),
    players: players.map((p) => ({ id: p.id, name: p.name })),
  })
  const bots = new Map(
    players.map((p) => [
      p.id,
      {
        strategy: definition.createStrategy(p.average),
        thrower: createThrower(modelFor(p.average)),
      },
    ]),
  )

  for (let turn = 0; turn < MAX_TURNS && !session.isFinished; turn++) {
    const bot = bots.get(session.currentPlayer.id)!
    const { input } = playStrategyTurn(game, bot.strategy, session, bot.thrower)
    const played = session.play(input)
    if (!played.ok) break
    session = played.session
  }

  const winner = session.state.players.find(
    (p: { finishPosition: number | null }) => p.finishPosition === 1,
  )
  if (winner) return winner.id
  // Nobody finished in time: the stronger player takes it.
  return [...players].sort((a, b) => b.average - a.average)[0].id
}
