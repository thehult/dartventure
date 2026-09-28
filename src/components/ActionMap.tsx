import React from 'react'
import type { Action } from '@/types/Scene'
import type { GameState } from '@/types/GameState'
import {
  canAfford,
  entryFee,
  isActionEnabled,
  isActionVisible,
} from '@/engine/flow'
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
            affordable={canAfford(action, state)}
          />
        ))}
    </div>
  )
}

type ActionIconProps = {
  action: Action
  enabled: boolean
  affordable: boolean
}

const ActionIcon: React.FC<ActionIconProps> = ({
  action,
  enabled,
  affordable,
}) => {
  const fee = entryFee(action)
  const hint = affordable ? action.hint : `You need $${fee} to enter`
  return (
    <button
      className="flex flex-col items-start justify-center w-32"
      style={{
        opacity: enabled ? 1 : 0.5,
        filter: enabled ? 'none' : 'grayscale(100%)',
        cursor: enabled ? 'pointer' : 'not-allowed',
      }}
      title={enabled ? action.description : (hint ?? action.description)}
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
      <span className="flex justify-center text-center text-md text-white break-keep whitespace-nowrap w-full [text-shadow:0_1px_3px_black]">
        {action.name}
      </span>
      {fee > 0 && (
        <span className="flex justify-center text-center text-sm text-white/80 w-full [text-shadow:0_1px_3px_black]">
          Entry ${fee}
        </span>
      )}
      {!enabled && hint && (
        <span className="flex justify-center text-center text-sm text-white/80 w-full [text-shadow:0_1px_3px_black]">
          {hint}
        </span>
      )}
    </button>
  )
}
