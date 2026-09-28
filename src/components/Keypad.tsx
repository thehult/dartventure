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

const INPUT_BUTTONS: Key[] = [
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
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  const handleKeyboard = (event: KeyboardEvent) => {
    if (!onKeyPress) return
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
    <div className="flex flex-row flex-wrap items-start justify-start w-full bg-neutral-950 text-neutral-50 mt-1 font-[Kalam]">
      {INPUT_BUTTONS.map((key) => (
        <button
          className="flex items-center justify-center w-1/3 bg-neutral-800 hover:bg-neutral-900 hover:cursor-pointer text-neutral-50 p-6 text-xl font-[Kalam]"
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
