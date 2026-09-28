import { type SceneId } from '@/scenes/scenes'
import { useNavigate } from '@tanstack/react-router'
import { useLocalStorage } from 'usehooks-ts'
import { useTournament } from './useTournament'
import { useCallback, useEffect, useMemo } from 'react'
import { useMatch } from './useMatch'
import type { MatchOptions } from '@/types/Match'
import type { TournamentOptions } from '@/types/Tournament'

type SceneRoute = 'match' | 'tournament' | ''

interface SceneState {
  sceneId: SceneId
  sceneRoute: SceneRoute
}

export const useGameFlow = () => {
  const { createTournament: _createTournament, hasTournament } = useTournament()
  const { createMatch: _createMatch, hasMatch } = useMatch()
  const [sceneState, setSceneState] = useLocalStorage<SceneState>(
    'currentSceneState',
    {
      sceneId: 'world',
      sceneRoute: '',
    },
  )
  const currentRoute = useMemo(
    () => ['', 'game', sceneState.sceneRoute].join('/'),
    [sceneState],
  )
  const navigate = useNavigate()

  const goToScene = (sceneId?: SceneId) => {
    setSceneState((_sceneState) => ({
      ..._sceneState,
      sceneId: sceneId ?? _sceneState.sceneId,
      sceneRoute: '',
    }))
  }

  const createMatch = (matchOptions: MatchOptions) => {
    _createMatch(matchOptions)
    setSceneState((_sceneState) => ({
      ..._sceneState,
      sceneRoute: 'match',
    }))
  }

  const createTournament = (options: TournamentOptions) => {
    _createTournament(options)
    setSceneState((_sceneState) => ({
      ..._sceneState,
      sceneRoute: 'tournament',
    }))
  }

  const reset = useCallback(() => {
    setSceneState((_sceneState) => ({
      sceneId: 'world',
      sceneRoute: '',
    }))
  }, [])

  useEffect(() => {
    if (sceneState.sceneRoute === 'match' && !hasMatch) {
      setSceneState((_sceneState) => ({
        ..._sceneState,
        sceneRoute: '',
      }))
    } else if (sceneState.sceneRoute === 'tournament' && !hasTournament) {
      setSceneState((_sceneState) => ({
        ..._sceneState,
        sceneRoute: '',
      }))
    } else {
      navigate({
        to: currentRoute,
      })
    }
  }, [sceneState])

  return {
    sceneId: sceneState.sceneId,
    sceneRoute: sceneState.sceneRoute,
    currentRoute,
    reset,
    goToScene,
    createMatch,
    createTournament,
  }
}
