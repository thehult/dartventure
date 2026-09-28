import React from 'react'
import { useGameSave } from '../hooks/useGameSave'
import type { Action } from '@/types/Actions'
import { useGameFlow } from '@/hooks/useGameFlow'

type ActionMapProps = {
  actions: Action[]
}

export const ActionMap: React.FC<ActionMapProps> = ({ actions }) => {
  return (
    <div className="flex flex-wrap flex-row items-center justify-center gap-12 w-full h-full p-6 ">
      {actions.map((action, idx) => (
        <ActionIcon key={idx} action={action} />
      ))}
    </div>
  )
}
type ActionIconProps = {
  action: Action
}

const ActionIcon: React.FC<ActionIconProps> = ({ action }) => {
  const gameSave = useGameSave()
  const { goToScene, createMatch, createTournament } = useGameFlow()

  // Check if all requirements are met
  const requirementsMet = gameSave.validateRequirements(action.requirements)
  const unlocked =
    action.unlocked_by === undefined
      ? true
      : gameSave.hasCompletedStory(action.unlocked_by)

  if (!unlocked) return

  const handleClick = () => {
    if (action.action === 'match') {
      console.log('Match action', action)
      createMatch({
        ...action.options,
        reward: action.reward,
        penalty: action.penalty,
      })
    } else if (action.action === 'navigate') {
      goToScene(action.sceneId)
    } else if (action.action === 'tournament') {
      createTournament({
        ...action.options,
        reward: action.reward,
        penalty: action.penalty,
      })
    }
  }

  return (
    <button
      className="flex flex-col items-start justify-center w-32"
      style={{
        opacity: requirementsMet ? 1 : 0.5,
        filter: requirementsMet ? 'none' : 'grayscale(100%)',
        cursor: requirementsMet ? 'pointer' : 'not-allowed',
      }}
      onClick={handleClick}
    >
      <div className="relative d-flex w-32 h-32 hover:scale-105 transition-transform duration-200">
        <div className="absolute inset-2 rounded-full bg-white/15 flex items-center justify-center"></div>
        <div
          style={
            { '--image-url': `url('${action.icon}')` } as React.CSSProperties
          }
          className="absolute d-flex w-32 h-32 bg-[image:var(--image-url)] bg-cover bg-top"
        ></div>
      </div>
      <span className="flex justify-center text-center text-md text-white break-keep whitespace-nowrap w-full">
        {action.name}
      </span>
    </button>
  )
}
