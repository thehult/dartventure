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
    </div>
  )
}
