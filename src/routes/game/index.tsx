import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/game/')({
  component: GameComponent,
})

function GameComponent() {
  return (
    <div>
      Hello "/game/"!<br></br>
      <Link to="/game/map">Go to Map</Link>
      <br></br>
      <Link to="/game/scene">Go to Scene</Link>
      <br></br>
      <Link
        to="/game/match"
        search={{
          sceneId: 'pub',
          gameId: 'x01',
          parameters: { play_from: 301 },
        }}
      >
        Go to Match
      </Link>
    </div>
  )
}
