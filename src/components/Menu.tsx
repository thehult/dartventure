export type MenuProps = {
  children?: React.ReactNode
}

export const Menu: React.FC<MenuProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-8">
      {children}
    </div>
  )
}

export type MenuButtonProps = {
  visible?: boolean
  onClick?: () => void
  children?: React.ReactNode
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  visible = true,
  onClick,
  children,
}) => {
  if (!visible) return

  return (
    <button
      className="w-full md:w-1/2 lg:w-1/4 py-6 bg-(--alternative-color) text-white rounded-sm text-xl font-semibold shadow hover:bg-(--secondary-color) hover:cursor-pointer transition"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export type MenuImageProps = {
  image: string
  visible?: boolean
}

export const MenuImage: React.FC<MenuImageProps> = ({
  image,
  visible = true,
}) => {
  if (!visible) return

  return <img src={image} alt="Game Logo" className="w-64 h-64 mb-8" />
}
