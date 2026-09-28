import { useTournament } from '@/hooks/useTournament'
import type { TournamentMatch } from '@/types/Tournament'

function TournamentMatchComponent({ match }: { match: TournamentMatch }) {
  const hasChildren = !!match.children

  return (
    <div className="relative flex flex-row items-center my-3">
      {/* Children matches to the left */}
      {hasChildren && (
        <div className="flex flex-col justify-between relative mr-8">
          {/* Vertical line connecting children */}
          <div className="absolute left-full w-8 h-full">
            <div className="absolute left-1/2 right-0 top-1/2 w-4 h-px bg-gray-400"></div>
            <div className="absolute left-0 right-1/2 top-1/4 w-4 h-px bg-gray-400"></div>
            <div className="absolute left-0 right-1/2 top-3/4 w-4 h-px bg-gray-400"></div>
            <div className="absolute left-1/2 top-1/4 h-1/2 w-px bg-gray-400"></div>
            {/* <div className="absolute left-0 top-1/8 h-1/4 w-px bg-gray-400"></div>
            <div className="absolute left-0 top-5/8 h-1/4 w-px bg-gray-400"></div> */}
          </div>
          {match.children!.map((child) => (
            <TournamentMatchComponent key={child.id} match={child} />
          ))}
        </div>
      )}

      {/* This match block */}
      <div className="flex flex-col items-center w-48">
        <div
          className={`text-md text-center py-2 px-2 py-1 rounded mb-1 w-full ${match.player1?.id === 'player' ? 'font-bold' : ''}`}
        >
          {match.player1?.name || '_'}
        </div>
        <div
          className={`text-md text-center py-2 px-2 py-1 rounded w-full  ${match.player2?.id === 'player' ? 'text-bold' : ''}`}
        >
          {match.player2?.name || '_'}
        </div>
      </div>
    </div>
  )
}

export function TournamentTree() {
  const { rootMatch } = useTournament()

  if (!rootMatch) return <></>

  return (
    <div className="flex items-center overflow-auto p-6 min-h-2/3 text-neutral-50 font-[Kalam]">
      <div className="bg-neutral-950 border-double border-white border-1">
        <h1 className="my-2 text-center text-2xl">Tournament</h1>
        <TournamentMatchComponent match={rootMatch} />
      </div>
    </div>
  )
}
