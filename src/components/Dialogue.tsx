import Markdown from 'react-markdown'

export type DialogProps = {
  visible: boolean
  speaker?: string
  children?: string
}

export const Dialogue = (props: DialogProps) => {
  return (
    <div
      className={`absolute w-full h-1/3 ${props.visible ? 'bottom-0' : '-bottom-3/2'} transition-all max-w-xl px-2 duration-1000 left-1/2 -translate-x-1/2`}
    >
      {props.speaker && (
        <div className="relative bg-black text-white opacity-80 w-2/5 py-1 px-2 font-bold border-1 border-white mb-1">
          {props.speaker}
        </div>
      )}
      <div className="relativ bg-black text-white opacity-80 h-1/2 mb-4 py-1 px-2 border-1 border-white justify-center items-center flex flex-col">
        <Markdown>{props.children}</Markdown>
      </div>
    </div>
  )
}
