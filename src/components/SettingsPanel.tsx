import { useState } from 'react'
import { Panel } from './Panel'
import { DifficultyPicker } from './DifficultyPicker'
import type { GameState } from '@/types/GameState'
import { actions } from '@/state/actions'

type SettingsPanelProps = {
  state: GameState
  onClose: () => void
  onQuit: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  state,
  onClose,
  onQuit,
}) => {
  const [name, setName] = useState(state.playerName)
  return (
    <Panel title="Settings" onClose={onClose}>
      <label className="block mb-3 short:mb-1">
        <span className="block text-white/80 mb-1">Name</span>
        <input
          className="w-full bg-black/70 border-1 border-white py-2 short:py-1 px-3"
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            actions.setPlayerName(name)
            setName((n) => n.trim() || state.playerName)
          }}
        />
      </label>
      <fieldset>
        <legend className="text-white/80 mb-1">Difficulty</legend>
        <DifficultyPicker
          value={state.difficulty}
          onChange={actions.setDifficulty}
        />
        <p className="text-xs text-white/60">
          Applies to opponents you meet from now on.
        </p>
      </fieldset>
      <button
        type="button"
        className="mt-4 short:mt-2 w-full py-3 short:py-1 border-1 border-white/50 rounded-sm hover:bg-white/10 cursor-pointer transition"
        onClick={() => {
          actions.setPlayerName(name)
          onQuit()
        }}
      >
        Save and quit to menu
      </button>
    </Panel>
  )
}
