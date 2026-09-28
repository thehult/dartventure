import { useState } from 'react'
import type { PlayerId } from '@dartgames/core'
import type { BracketMatch, Tournament } from '@/types/Tournament'
import { PLAYER_ID } from '@/types/Player'

const roundName = (round: number, rounds: number) => {
  const fromEnd = rounds - round
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semi-finals'
  if (fromEnd === 2) return 'Quarter-finals'
  return `Round ${round}`
}

/** The round the player is playing, or the last one they played. */
const playerRound = (tournament: Tournament) => {
  const matches = tournament.matches.filter(
    (m) => m.player1 === PLAYER_ID || m.player2 === PLAYER_ID,
  )
  return Math.max(1, ...matches.map((m) => m.round))
}

function Slot({
  tournament,
  match,
  playerId,
}: {
  tournament: Tournament
  match: BracketMatch
  playerId?: PlayerId
}) {
  const player = tournament.players.find((p) => p.id === playerId)
  const won = playerId !== undefined && match.winner === playerId
  const lost = match.winner !== undefined && !won
  return (
    <div
      className={[
        'text-md text-center py-1 px-2 w-full truncate',
        playerId === PLAYER_ID ? 'font-bold' : '',
        lost ? 'line-through opacity-50' : '',
        won ? 'text-(--primary-color)' : '',
      ].join(' ')}
    >
      {player?.name ?? '_'}
    </div>
  )
}

function Match({
  tournament,
  match,
}: {
  tournament: Tournament
  match: BracketMatch
}) {
  const isPlayers = match.player1 === PLAYER_ID || match.player2 === PLAYER_ID
  return (
    <div
      className={`border-1 ${isPlayers ? 'border-(--primary-color)' : 'border-white/40'}`}
    >
      <Slot tournament={tournament} match={match} playerId={match.player1} />
      <div className="h-px bg-white/40" />
      <Slot tournament={tournament} match={match} playerId={match.player2} />
    </div>
  )
}

const roundMatches = (tournament: Tournament, round: number) =>
  tournament.matches.filter((m) => m.round === round)

/** The whole bracket, one column per round. */
function FullBracket({ tournament }: { tournament: Tournament }) {
  const rounds = Array.from({ length: tournament.rounds }, (_, i) => i + 1)
  return (
    // `w-max mx-auto` centers the bracket when it fits and lets it scroll
    // from its left edge when it doesn't.
    <div className="w-full overflow-x-auto">
      <div className="flex flex-row items-stretch gap-6 w-max mx-auto">
        {rounds.map((round) => (
          <div key={round} className="flex flex-col w-36">
            <h2 className="text-center text-lg mb-2">
              {roundName(round, tournament.rounds)}
            </h2>
            <div className="flex flex-col justify-around flex-grow gap-3">
              {roundMatches(tournament, round).map((match) => (
                <Match key={match.id} tournament={tournament} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** One round at a time, for narrow screens. */
function RoundByRound({ tournament }: { tournament: Tournament }) {
  const [round, setRound] = useState(() => playerRound(tournament))
  const arrowClass =
    'px-4 py-2 text-2xl disabled:opacity-30 enabled:cursor-pointer'
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex items-center justify-between">
        <button
          className={arrowClass}
          aria-label="Previous round"
          disabled={round <= 1}
          onClick={() => setRound(round - 1)}
        >
          ‹
        </button>
        <h2 className="text-lg">{roundName(round, tournament.rounds)}</h2>
        <button
          className={arrowClass}
          aria-label="Next round"
          disabled={round >= tournament.rounds}
          onClick={() => setRound(round + 1)}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-2 short:grid-cols-4 gap-2">
        {roundMatches(tournament, round).map((match) => (
          <Match key={match.id} tournament={tournament} match={match} />
        ))}
      </div>
    </div>
  )
}

export function TournamentTree({ tournament }: { tournament: Tournament }) {
  return (
    <>
      <div className="hidden md:block short:hidden w-full">
        <FullBracket tournament={tournament} />
      </div>
      {/* Phones, including ones held sideways. */}
      <div className="md:hidden short:block w-full">
        <RoundByRound tournament={tournament} />
      </div>
    </>
  )
}
