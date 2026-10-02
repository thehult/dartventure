import React from 'react'
import { useEventListener } from 'usehooks-ts'

export type Key =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'undo'
  | 'enter'

const INPUT_BUTTONS: Array<Key> = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'undo',
  '0',
  'enter',
]

const keyToString = (key: Key): string => {
  switch (key) {
    case 'undo':
      return '←'
    case 'enter':
      return 'Enter'
    default:
      return key
  }
}

type KeypadProps = {
  onKeyPress?: (key: Key) => void
  /** Shown but not usable, e.g. during the opponent's turn. */
  disabled?: boolean
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress, disabled = false }) => {
  const handleKeyboard = (event: KeyboardEvent) => {
    if (!onKeyPress || disabled) return
    if (event.repeat) return

    if (event.key === 'Enter') onKeyPress('enter')
    else if (event.key === 'Backspace' || event.key === 'Delete')
      onKeyPress('undo')
    else {
      const num = parseInt(event.key)
      if (!isNaN(num)) onKeyPress(num.toString() as Key)
    }
  }

  useEventListener('keydown', handleKeyboard)

  return (
    <div
      className={`grid grid-cols-3 short:grid-rows-4 w-full md:w-2/3 xl:w-1/2 short:w-1/2 bg-neutral-950 text-neutral-50 font-[Kalam] transition-opacity ${disabled ? 'opacity-50' : ''}`}
    >
      {INPUT_BUTTONS.map((key) => (
        <button
          className="flex items-center justify-center bg-neutral-800 hover:bg-neutral-900 active:bg-neutral-700 enabled:hover:cursor-pointer text-neutral-50 py-5 short:py-0 text-2xl font-[Kalam] select-none"
          disabled={disabled}
          onClick={() => onKeyPress?.(key)}
          key={key}
        >
          {keyToString(key)}
        </button>
      ))}
    </div>
  )
}

export default Keypad
