import { ScoreInput } from '@dartgames/core'
import { useGame } from '@dartgames/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type {X01} from '@dartgames/games';
import type { GameComponent } from '../GameComponent'
import type { DartPlayer } from '@/types/Player'
import type {Key} from '@/components/Keypad';
import Keypad from '@/components/Keypad'

const X01Pub: GameComponent = ({ localPlayerId }) => {
  const { game, state, running, history, submitInput } = useGame<X01>()
  const players = useMemo<Array<DartPlayer>>(
    () => game.players as Array<DartPlayer>,
    [game],
  )
  const [input, setInput] = useState<string>('')
  const isPlayersTurn = running && state.currentPlayer === localPlayerId

  const handleButtonClick = (button: Key) => {
    if (!isPlayersTurn) return
    if (button === 'undo') {
      setInput((prev) => prev.substring(0, prev.length - 1))
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
  const chalkboard = useMemo<Record<string, Array<ChalkboardEntry>>>(() => {
    const scores: Record<string, Array<ChalkboardEntry>> = players.reduce(
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
    return scores
  }, [history])

  // Keep the latest scores in view as the chalkboard fills up.
  const chalkboardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = chalkboardRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [history, input])

  return (
    // The chalkboard takes whatever room the keypad leaves. On short screens
    // (a phone held sideways) they sit side by side.
    <div className="flex flex-col short:flex-row items-center short:items-stretch gap-1 short:gap-2 w-full h-full min-h-0">
      <div
        ref={chalkboardRef}
        className="flex flex-row justify-start items-start w-full md:w-2/3 xl:w-1/2 short:w-1/2 flex-1 min-h-0 bg-neutral-950 border-double border-white border-1 overflow-y-auto"
      >
        {players.map((player, pidx) => (
          <div
            className="flex flex-col items-center justify-start w-full min-h-full text-4xl text-neutral-50 pt-2 pb-2 font-[Kalam]"
            key={player.id}
          >
            <span className="text-lg mt-0">{player.name}</span>
            <div className="flex flex-col items-center w-full px-4 sm:px-8">
              {chalkboard[player.id].map((s, i, a) => (
                <div
                  className={`flex w-full items-end ${pidx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  key={`history-${player.id}-${i}`}
                >
                  <span
                    className={`w-1/2  text-3xl ${pidx % 2 === 0 ? 'text-left' : 'text-right'}`}
                  >
                    {s.hit ?? ' '}
                  </span>
                  <span
                    className={`w-1/2 font-bold text-4xl text-center ${i < a.length - 1 ? 'line-through' : ''}`}
                    key={`history-score-${player.id}-${i}`}
                  >
                    {s.score}
                  </span>
                </div>
              ))}
              {player.id === state.currentPlayer && (
                <div className="flex flex-row w-full items-end">
                  <span className="w-full text-left text-3xl pt-1">
                    {input}
                  </span>
                  <span className="w-full text-left text-4xl"></span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {running && (
        <Keypad onKeyPress={handleButtonClick} disabled={!isPlayersTurn} />
      )}
    </div>
  )
}

export default X01Pub
