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

export function TournamentTree({ tournament }: { tournament: Tournament }) {
  const rounds = Array.from({ length: tournament.rounds }, (_, i) => i + 1)

  return (
    <div className="flex flex-row items-stretch gap-6 overflow-x-auto">
      {rounds.map((round) => (
        <div key={round} className="flex flex-col min-w-36">
          <h2 className="text-center text-lg mb-2">
            {roundName(round, tournament.rounds)}
          </h2>
          <div className="flex flex-col justify-around flex-grow gap-3">
            {tournament.matches
              .filter((m) => m.round === round)
              .map((match) => (
                <div key={match.id} className="border-1 border-white/40">
                  <Slot
                    tournament={tournament}
                    match={match}
                    playerId={match.player1}
                  />
                  <div className="h-px bg-white/40" />
                  <Slot
                    tournament={tournament}
                    match={match}
                    playerId={match.player2}
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
