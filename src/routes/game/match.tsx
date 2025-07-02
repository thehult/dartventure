import { Background } from '@/components/Background'
import { useGameContext } from '@/components/GameContext'
import X01 from '@/games/X01'
import { createFileRoute } from '@tanstack/react-router'

type MatchOptions = {
  gameId: string
  parameters?: Record<string, any>
}

export const Route = createFileRoute('/game/match')({
  component: MatchComponent,
  validateSearch: (search): MatchOptions => {
    return {
      gameId: (search.gameId as string) ?? 'error',
      parameters: (search.parameters as Record<string, any>) ?? {},
    }
  },
})

function MatchComponent() {
  const { gameId } = Route.useSearch()
  const { scene } = useGameContext()

  const handleGameOver = (playerWon: boolean) => {
    console.log(`Game over! Player won: ${playerWon}`)
  }

  return (
    <Background background={scene.background}>
      <div className="flex flex-col items-center justify-start justify-self-center w-full lg:w-4/5 xl:w-3/5 h-full p-4">
        {gameId === 'x01' && (
          <X01
            startScore={301}
            opponent={{
              name: 'Drunkard',
              skill: 0.1,
            }}
            onGameOver={handleGameOver}
          />
        )}
      </div>
    </Background>
  )
}
