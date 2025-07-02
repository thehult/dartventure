import { useGameContext } from '@/components/GameContext'
import { useGameSave } from '@/components/useGameSave'
import type { SceneId } from '@/scenes/scenes'
import type { Opponent } from '@/types/Opponent'
import React, { useCallback, useMemo, useState } from 'react'

const DEFAULT_START_SCORE = 501
const INPUT_BUTTONS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'Undo',
  '0',
  'Enter',
]

const styles: Record<SceneId, Record<string, string>> = {
  pub: {
    scoreDisplay:
      'flex flex-row justify-stretch items-center w-full border-double border-white border-1',
    playerScoreDisplay:
      'flex flex-col items-center justify-start w-full text-5xl bg-neutral-950 text-neutral-50 pt-2 pb-8 font-[Kalam]',
    playerName: 'text-lg mt-0',
    input:
      'flex flex-row items-center justify-center w-2/3 md:w-1/2 h-24 bg-neutral-950 text-neutral-50 text-5xl font-[Kalam]',
    inputButtonArea:
      'flex flex-row flex-wrap items-start justify-start w-full bg-neutral-950 text-neutral-50 mt-1  font-[Kalam]',
    inputButton:
      'flex items-center justify-center w-1/3 bg-neutral-800 hover:bg-neutral-900 text-neutral-50 p-6 text-xl font-[Kalam]',
  },
}

type X01Props = {
  startScore?: number
  opponent: Opponent
  first?: 'player' | 'opponent' | 'random'
  onGameOver?: (playerWon: boolean) => void
}

const X01: React.FC<X01Props> = ({
  startScore = DEFAULT_START_SCORE,
  opponent,
  first = 'random',
  onGameOver,
}) => {
  const { playerName } = useGameSave()
  const { sceneId } = useGameContext()
  const getStyle = useCallback(
    (style: string) => ({
      className: styles[sceneId]?.[style] ?? '',
    }),
    [sceneId],
  )
  const players = useMemo(
    () => [playerName, opponent.name],
    [playerName, opponent.name],
  )
  const startPlayer = useMemo(() => {
    if (first === 'player') return 0
    if (first === 'opponent') return 1
    return Math.random() < 0.5 ? 0 : 1
  }, [first])
  const [scores, setScores] = useState<number[]>([startScore, startScore])
  const [currentPlayer, setCurrentPlayer] = useState(startPlayer)
  const [input, setInput] = useState<string>('')

  const handleButtonClick = (button: string) => {
    if (button === 'Undo') {
      setInput((prev) => prev.slice(0, -1))
    } else if (button === 'Enter') {
      const score = parseInt(input)
      if (!isNaN(score) && score >= 0) {
        const newScores = [...scores]
        newScores[currentPlayer] -= score
        if (newScores[currentPlayer] > 1) {
          setScores(newScores)
          setCurrentPlayer((currentPlayer + 1) % 2)
        } else if (newScores[currentPlayer] === 0) {
          setScores(newScores)
          onGameOver?.(currentPlayer === 0)
        } else if (newScores[currentPlayer] === 1) {
          setCurrentPlayer((currentPlayer + 1) % 2)
        } else {
          setCurrentPlayer((currentPlayer + 1) % 2)
        }
      }
      setInput('')
    } else {
      if (input.length < 3) {
        const score = parseInt(input + button)
        if (score <= 180 && score <= scores[currentPlayer]) {
          setInput((prev) => prev + button)
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-start w-full h-full">
      <div {...getStyle('scoreDisplay')}>
        <div {...getStyle('playerScoreDisplay')}>
          <span {...getStyle('playerName')}>{players[0]}</span>
          <span
            {...getStyle('playerScore')}
            style={currentPlayer === 0 ? { textDecoration: 'underline' } : {}}
          >
            {scores[0]}
          </span>
        </div>
        <div {...getStyle('playerScoreDisplay')}>
          <span {...getStyle('playerName')}>{players[1]}</span>
          <span
            {...getStyle('playerScore')}
            style={currentPlayer === 1 ? { textDecoration: 'underline' } : {}}
          >
            {scores[1]}
          </span>
        </div>
      </div>
      <div className="w-full flex-grow-1"></div>
      <div {...getStyle('input')}>{input}</div>
      <div {...getStyle('inputButtonArea')}>
        {INPUT_BUTTONS.map((num) => (
          <button
            {...getStyle('inputButton')}
            onClick={() => handleButtonClick(num)}
            key={num}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}

export default X01
