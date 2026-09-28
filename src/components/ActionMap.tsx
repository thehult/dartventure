import React from 'react'
import type { Action } from '@/types/Scene'
import type { GameState } from '@/types/GameState'
import { isActionEnabled, isActionVisible } from '@/engine/flow'
import { actions } from '@/state/actions'

type ActionMapProps = {
  sceneActions: Array<Action>
  state: GameState
}

export const ActionMap: React.FC<ActionMapProps> = ({
  sceneActions,
  state,
}) => {
  return (
    <div className="relative z-10 flex flex-wrap flex-row items-center justify-center gap-12 w-full h-full p-6">
      {sceneActions
        .filter((action) => isActionVisible(action, state))
        .map((action, idx) => (
          <ActionIcon
            key={idx}
            action={action}
            enabled={isActionEnabled(action, state)}
          />
        ))}
    </div>
  )
}

type ActionIconProps = {
  action: Action
  enabled: boolean
}

const ActionIcon: React.FC<ActionIconProps> = ({ action, enabled }) => {
  return (
    <button
      className="flex flex-col items-start justify-center w-32"
      style={{
        opacity: enabled ? 1 : 0.5,
        filter: enabled ? 'none' : 'grayscale(100%)',
        cursor: enabled ? 'pointer' : 'not-allowed',
      }}
      title={enabled ? action.description : (action.hint ?? action.description)}
      disabled={!enabled}
      onClick={() => actions.perform(action)}
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
      {!enabled && action.hint && (
        <span className="flex justify-center text-center text-sm text-white/80 w-full">
          {action.hint}
        </span>
      )}
    </button>
  )
}
