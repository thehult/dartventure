export type MenuProps = {
  children?: React.ReactNode
}

export const Menu: React.FC<MenuProps> = ({ children }) => {
  return (
    // Scrolls when it doesn't fit, e.g. a phone held sideways. The inner
    // `m-auto` centers it without cutting off the top when it overflows.
    <div className="absolute inset-0 flex overflow-y-auto">
      <div className="m-auto flex flex-col items-center w-full gap-4 short:gap-2 px-8 py-6">
        {children}
      </div>
    </div>
  )
}

export type MenuButtonProps = {
  visible?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  children?: React.ReactNode
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  visible = true,
  type = 'button',
  onClick,
  children,
}) => {
  if (!visible) return

  return (
    <button
      type={type}
      className="w-full md:w-1/2 lg:w-1/4 py-6 short:py-3 bg-(--alternative-color) text-white rounded-sm text-xl font-semibold shadow hover:bg-(--secondary-color) hover:cursor-pointer transition"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export type MenuImageProps = {
  image: string
  visible?: boolean
  small?: boolean
}

export const MenuImage: React.FC<MenuImageProps> = ({
  image,
  visible = true,
  small = false,
}) => {
  if (!visible) return

  return (
    <img
      src={image}
      alt="Game Logo"
      className={
        small
          ? 'w-32 h-32 short:w-20 short:h-20'
          : 'w-64 h-64 mb-8 short:w-32 short:h-32 short:mb-0'
      }
    />
  )
}
