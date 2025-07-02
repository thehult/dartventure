import { GameContextProvider } from '@/components/GameContext'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <GameContextProvider>
      <Outlet />
    </GameContextProvider>
  ),
})
