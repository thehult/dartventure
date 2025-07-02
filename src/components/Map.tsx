import type { Action } from '@/types/Scene'
import React from 'react'
import { useGameSave } from './useGameSave'

type MapProps = {
  actions: Action[]
}

export const Map: React.FC<MapProps> = ({ actions }) => {
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

  // Check if all requirements are met
  const requirementsMet = gameSave.validateRequirements(action.requirements)
  const unlocked =
    action.unlocked_by === undefined
      ? true
      : gameSave.hasCompletedStory(action.unlocked_by)

  if (!unlocked) return

  return (
    <div
      className="flex flex-col items-start justify-center w-32"
      style={{
        opacity: requirementsMet ? 1 : 0.5,
        filter: requirementsMet ? 'none' : 'grayscale(100%)',
        cursor: requirementsMet ? 'pointer' : 'not-allowed',
      }}
    >
      <div className="relative d-flex w-32 h-32 hover:scale-105 transition-transform duration-200">
        <div className="absolute inset-2 rounded-full bg-white/15 flex items-center justify-center"></div>
        <div
          style={
            { '--image-url': `url('${action.icon}')` } as React.CSSProperties
          }
          className="absolute d-flex w-32 h-32 bg-[image:var(--image-url)] bg-cover bg-center"
        ></div>
      </div>
      <span className="flex justify-center text-center text-md text-white break-keep whitespace-nowrap w-full">
        {action.name}
      </span>
    </div>
  )
}
