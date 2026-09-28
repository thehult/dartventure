import Markdown from 'react-markdown'

export type DialogueProps = {
  visible: boolean
  speaker?: string
  children?: string
  /** Replaces the click-to-continue behavior with buttons. */
  choices?: Array<string>
  onChoice?: (index: number) => void
  /** Called when clicking anywhere, unless there are choices. */
  onContinue?: () => void
}

export const Dialogue = (props: DialogueProps) => {
  const hasChoices = props.choices !== undefined && props.choices.length > 0

  return (
    <>
      {props.visible && props.onContinue && !hasChoices && (
        // Covers the screen so a click anywhere continues. It is only rendered
        // while the dialogue is shown, so the click that opened it can't hit it.
        <div
          className="absolute inset-0 z-40 cursor-pointer"
          onClick={props.onContinue}
        />
      )}
      <div
        className={`absolute z-40 w-full ${props.visible ? 'bottom-0' : '-bottom-3/2'} transition-all max-w-xl px-2 duration-1000 left-1/2 -translate-x-1/2 pointer-events-none`}
      >
        {props.speaker && (
          <div className="relative bg-black text-white opacity-80 w-2/5 py-1 px-2 font-bold border-1 border-white mb-1">
            {props.speaker}
          </div>
        )}
        <div className="relative bg-black text-white opacity-80 min-h-24 mb-4 py-2 px-2 border-1 border-white justify-center items-center flex flex-col">
          <Markdown>{props.children}</Markdown>
          {hasChoices && (
            <div className="flex flex-col w-full gap-1 mt-2 pointer-events-auto">
              {props.choices!.map((choice, i) => (
                <button
                  key={i}
                  className="w-full py-2 px-2 text-left border-1 border-white/50 hover:bg-white/20 cursor-pointer"
                  onClick={() => props.onChoice?.(i)}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
