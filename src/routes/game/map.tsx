import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/game/map')({
  component: MapComponent,
})

function MapComponent() {
  return <div>Hello "/game/map"!</div>
}
