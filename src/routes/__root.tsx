import { SceneContextProvider } from '@/components/GameContext'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <SceneContextProvider>
      <Outlet />
    </SceneContextProvider>
  ),
})
