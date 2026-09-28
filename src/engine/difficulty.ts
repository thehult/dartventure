/**
 * Difficulty changes how strong opponents are. Opponents normally play
 * relative to the player's own average, with a minimum average per venue
 * (see `resolveAverage`). Difficulty shifts every opponent's average and
 * scales those minimums.
 */
export type Difficulty = 'easy' | 'normal' | 'hard' | 'pro'

export type DifficultySettings = {
  name: string
  description: string
  /** Added to every opponent's average. */
  averageOffset: number
  /** Multiplies the venues' minimum opponent averages. 0 turns them off. */
  floorScale: number
  /**
   * The player's average in a new game, before any matches have been played.
   * Roughly the level the difficulty is aimed at.
   */
  startingAverage: number
}

export const DIFFICULTIES: Record<Difficulty, DifficultySettings> = {
  easy: {
    name: 'Easy',
    description:
      'Opponents play well below your level, whatever your average. Anyone can become world champion.',
    averageOffset: -4,
    floorScale: 0,
    startingAverage: 30,
  },
  normal: {
    name: 'Normal',
    description:
      'Opponents play a bit below your level, but the big stages expect an average of about 50.',
    averageOffset: 0,
    floorScale: 1,
    startingAverage: 50,
  },
  hard: {
    name: 'Hard',
    description: 'Opponents play close to your level. A real challenge.',
    averageOffset: 3,
    floorScale: 1.15,
    startingAverage: 65,
  },
  pro: {
    name: 'Pro',
    description:
      'Opponents match your level at the top. For strong players who want a fight.',
    averageOffset: 5,
    floorScale: 1.3,
    startingAverage: 80,
  },
}

export const DIFFICULTY_ORDER: Array<Difficulty> = [
  'easy',
  'normal',
  'hard',
  'pro',
]

export const DEFAULT_DIFFICULTY: Difficulty = 'normal'
