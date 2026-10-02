import { usePreload } from '../hooks/usePreload'

export type CharacterProps = {
  image?: string
  visible?: boolean
  onEntered?: () => void
  onExited?: () => void
  children?: React.ReactNode
}

export const Character = (props: CharacterProps) => {
  const loaded = usePreload(props.image)

  const handleTransitionEnd = () => {
    if (props.visible) props.onEntered?.()
    else props.onExited?.()
  }

  return (
    <div
      style={
        { '--image-url': `url('${props.image ?? ''}')` } as React.CSSProperties
      }
      className={`absolute h-9/10 w-2/1 bottom-0 ${loaded && props.visible ? '-left-2/5' : 'left-2/1'} bg-[image:var(--image-url)] bg-contain bg-top bg-no-repeat transition-all duration-1000`}
      onTransitionEnd={handleTransitionEnd}
    >
      {props.children}
    </div>
  )
}
