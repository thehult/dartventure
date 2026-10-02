import { stateAfterTurn } from '@thehult/dartgames-core'
import type {
  X01Config,
  X01Input,
  X01State,
  X01TurnResult,
} from '@thehult/dartgames-games/x01'
import { useMemo, useState } from 'react'
import type { GameComponent, GameHandle } from '../GameComponent'
import Keypad, { type Key } from '@/components/Keypad'

const X01Pub: GameComponent = ({ game: handle, localPlayerId }) => {
  const game = handle as GameHandle<X01State, X01Config, X01Input, X01TurnResult>
  const { state, history, submitTurn } = game
  const running = !game.isFinished
  const currentPlayerId = game.currentPlayer.id
  const players = state.players
  const [input, setInput] = useState<string>('')

  const handleButtonClick = (button: Key) => {
    if (button === 'undo') {
      setInput((input) => input.substring(0, input.length - 1))
    } else if (button === 'enter') {
      let score = parseInt(input)
      if (isNaN(score)) score = 0
      submitTurn(score)
      setInput('')
    } else {
      if (input.length < 3) {
        const score = parseInt(input + button)
        if (score <= 180 && score <= game.currentPlayer.remainingScore) {
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
    const start = history.turns[0]?.stateBefore ?? state
    const scores: Record<string, ChalkboardEntry[]> = Object.fromEntries(
      players.map((p, i) => [p.id, [{ score: start.players[i].remainingScore }]]),
    )
    history.turns.forEach((turn, i) => {
      const before = turn.stateBefore
      const after = stateAfterTurn(history, i, state)
      const idx = before.currentPlayerIndex
      scores[before.players[idx].id].push({
        hit: before.players[idx].remainingScore - after.players[idx].remainingScore,
        score: after.players[idx].remainingScore,
      })
    })
    return scores
  }, [history, state, players])

  return (
    <div className="flex flex-col items-center justify-start w-full h-full">
      <div className="flex flex-row justify-start items-start w-full md:w-2/3 xl:w-1/2 h-5/8 bg-neutral-950 border-double border-white border-1 overflow-y-scroll">
        {players.map((player, pidx) => (
          <div
            className="flex flex-col items-center justify-start w-full h-full text-4xl text-neutral-50 pt-2 pb-2 font-[Kalam]"
            key={player.id}
          >
            <span className="text-lg mt-0">{player.name ?? player.id}</span>
            <div className="flex flex-col items-center  w-full px-8 ">
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
              {running && player.id === currentPlayerId && (
                <div className="flex flex-row w-full items-end">
                  <span className="w-full text-left text-3xl pt-1">
                    {input}
                  </span>
                  <span className="w-full text-left text-4xl"></span>
                </div>
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
      {running && currentPlayerId === localPlayerId && (
        <Keypad onKeyPress={handleButtonClick} />
      )}
    </div>
  )
}

export default X01Pub
