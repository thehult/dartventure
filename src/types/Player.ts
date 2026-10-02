export const PLAYER_ID = 'player'

export interface DartPlayer {
  id: string
  name: string
}

export interface BotPlayer extends DartPlayer {
  /** Three-dart average the bot throws at. */
  average: number
}

export const MIN_AVERAGE = 15
export const MAX_AVERAGE = 110

/** Bots can only be created for whole-number averages within this range. */
export const clampAverage = (average: number) =>
  Math.round(Math.max(MIN_AVERAGE, Math.min(MAX_AVERAGE, average)))

export const isBot = (player: DartPlayer): player is BotPlayer =>
  'average' in player
