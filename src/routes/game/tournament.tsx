import { Background } from '@/components/Background'
import { createFileRoute } from '@tanstack/react-router'
import type { SceneId } from '@/scenes/scenes'
import { TournamentTree } from '@/components/TournamentTree'
import { useScene } from '@/hooks/useScene'
import { useTournament } from '@/hooks/useTournament'
import { useGameFlow } from '@/hooks/useGameFlow'

export type SceneSearchParams = {
  sceneId: SceneId
}

export const Route = createFileRoute('/game/tournament')({
  component: TournamentComponent,
})

function TournamentComponent() {
  const { scene } = useScene()
  const { goToScene } = useGameFlow()
  const { hasTournament } = useTournament()

  if (!hasTournament) goToScene()

  return (
    <Background background={scene.background}>
      <TournamentTree />
    </Background>
  )
}
