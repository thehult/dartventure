import React from 'react'
import type { Action, PanelId } from '@/types/Scene'
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
  onPanel: (panel: PanelId) => void
}

export const ActionMap: React.FC<ActionMapProps> = ({
  sceneActions,
  state,
  onPanel,
}) => {
  return (
    // Scrolls when the actions don't fit. The inner `m-auto` centers them
    // without cutting off the top when they overflow.
    <div className="relative z-10 flex w-full h-full overflow-y-auto pt-12 pb-4 px-4">
      <div className="m-auto flex flex-wrap flex-row items-start justify-center gap-x-6 gap-y-8 sm:gap-12 short:gap-x-4 short:gap-y-2">
        {sceneActions
          .filter((action) => isActionVisible(action, state))
          .map((action, idx) => (
            <ActionIcon
              key={idx}
              action={action}
              enabled={isActionEnabled(action, state)}
              affordable={canAfford(action, state)}
              onPanel={onPanel}
            />
          ))}
      </div>
    </div>
  )
}

type ActionIconProps = {
  action: Action
  enabled: boolean
  affordable: boolean
  onPanel: (panel: PanelId) => void
}

const ActionIcon: React.FC<ActionIconProps> = ({
  action,
  enabled,
  affordable,
  onPanel,
}) => {
  const fee = entryFee(action)
  const hint = affordable ? action.hint : `You need $${fee} to enter`
  return (
    <button
      className="flex flex-col items-center justify-start w-28 sm:w-32 short:w-24"
      style={{
        opacity: enabled ? 1 : 0.5,
        filter: enabled ? 'none' : 'grayscale(100%)',
        cursor: enabled ? 'pointer' : 'not-allowed',
      }}
      title={enabled ? action.description : (hint ?? action.description)}
      disabled={!enabled}
      onClick={() =>
        action.action === 'panel'
          ? onPanel(action.panel)
          : actions.perform(action)
      }
    >
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 short:w-20 short:h-20 hover:scale-105 transition-transform duration-200">
        <div className="absolute inset-2 rounded-full bg-white/15 flex items-center justify-center"></div>
        <div
          style={
            { '--image-url': `url('${action.icon}')` } as React.CSSProperties
          }
          className="absolute inset-0 bg-[image:var(--image-url)] bg-cover bg-top"
        ></div>
      </div>
      <span className="text-center text-sm sm:text-base leading-tight text-white w-full [text-shadow:0_1px_3px_black]">
        {action.name}
      </span>
      {fee > 0 && (
        <span className="text-center text-xs sm:text-sm text-white/80 w-full [text-shadow:0_1px_3px_black]">
          Entry ${fee}
        </span>
      )}
      {!enabled && hint && (
        <span className="text-center text-xs sm:text-sm text-white/80 w-full [text-shadow:0_1px_3px_black]">
          {hint}
        </span>
      )}
    </button>
  )
}
