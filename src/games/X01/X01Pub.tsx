import { ScoreInput } from '@dartgames/core'
import { type X01 } from '@dartgames/games'
import { useGame } from '@dartgames/react'
import { useMemo, useState } from 'react'
import type { GameComponent } from '../GameComponent'
import type { DartPlayer } from '@/types/Player'
import Keypad, { type Key } from '@/components/Keypad'

const X01Pub: GameComponent = ({ localPlayerId }) => {
  const { game, state, running, history, submitInput } = useGame<X01>()
  const players = useMemo<DartPlayer[]>(
    () => game.players as DartPlayer[],
    [game],
  )
  const [input, setInput] = useState<string>('')

  const handleButtonClick = (button: Key) => {
    if (button === 'undo') {
      setInput((input) => input.substring(0, input.length - 1))
    } else if (button === 'enter') {
      let score = parseInt(input)
      if (isNaN(score)) score = 0
      submitInput(new ScoreInput(score))
      setInput('')
    } else {
      if (input.length < 3) {
        const score = parseInt(input + button)
        if (score <= 180 && score <= state.scores[state.currentPlayer]) {
          setInput((prev) => prev + button)
        }
      }
    }
  }

  interface ChalkboardEntry {
    hit?: number
    score: number
  }
  const chalkboard = useMemo<Record<string, ChalkboardEntry[]>>(() => {
    const scores: Record<string, ChalkboardEntry[]> = players.reduce(
      (s, p) => ({ ...s, [p.id]: [{ score: history[0].scores[p.id] }] }),
      {},
    )
    let previousPlayer = history[0].currentPlayer
    for (let i = 1; i < history.length; i++) {
      const turn: ChalkboardEntry = {
        hit:
          history[i - 1].scores[previousPlayer] -
          history[i].scores[previousPlayer],
        score: history[i].scores[previousPlayer],
      }

      scores[previousPlayer].push(turn)
      previousPlayer = history[i].currentPlayer
    }
    console.log('Chalkboard', scores)
    return scores
  }, [history])

  return (
    <div className="flex flex-col items-center justify-start w-full h-full">
      <div className="flex flex-row justify-start items-start w-full md:w-2/3 xl:w-1/2 h-5/8 bg-neutral-950 border-double border-white border-1 overflow-y-scroll">
        {players.map((player) => (
          <div
            className="flex flex-col items-center justify-start w-full h-full text-4xl text-neutral-50 pt-2 pb-2 font-[Kalam]"
            key={player.id}
          >
            <span className="text-lg mt-0">{player.name}</span>
            <div className="flex flex-col  items-center  w-full px-8 ">
              {chalkboard[player.id].map((s, i, a) => (
                <div
                  className="flex flex-row w-full"
                  key={`history-${player.id}-${i}`}
                >
                  <span className={`w-1/2 text-left`}>{s.hit ?? ' '}</span>
                  <span
                    className={`w-1/2 text-center ${i < a.length - 1 ? 'line-through' : ''}`}
                    key={`history-score-${player.id}-${i}`}
                  >
                    {s.score}
                  </span>
                </div>
              ))}
              {player.id === state.currentPlayer && (
                <span className="w-full text-left">{input}</span>
              )}
            </div>
            {/* <span
              className=""
              style={
                state.currentPlayer === player.id
                  ? { textDecoration: 'underline' }
                  : {}
              }
            >
              {state.scores[player.id]}
            </span> */}
          </div>
        ))}
      </div>
      <div className="w-full flex-grow-1"></div>
      {/* <div className="flex flex-row items-center justify-center w-2/3 md:w-1/2 h-24 bg-neutral-950 text-neutral-50 text-5xl font-[Kalam]">
        {input}
      </div> */}
      {running && state.currentPlayer === localPlayerId && (
        <Keypad onKeyPress={handleButtonClick} />
      )}
    </div>
  )
}

export default X01Pub
