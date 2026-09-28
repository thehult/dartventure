export type BackgroundProps = {
  background: string
  children?: React.ReactNode
}

export const Background = (props: BackgroundProps) => {
  return (
    <div
      style={
        { '--image-url': `url('${props.background}')` } as React.CSSProperties
      }
      className={`fixed inset-x-0 top-0 h-dvh bg-black bg-[image:var(--image-url)] bg-cover bg-center bg-no-repeat overflow-hidden`}
    >
      {props.children}
    </div>
  )
}
