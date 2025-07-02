export type MenuProps = {
  visible: boolean
  children?: React.ReactNode
}

export const Menu = (props: MenuProps) => {
  return (
    <div
      className={`absolute w-full h-full w-full transition-all px-2 duration-200 justify-center items-center flex flex-col`}
    >
      {props.children}
    </div>
  )
}

export type MenuItemProps = {
  visible: boolean
  children?: React.ReactNode
}

export const MenuItem = (props: { children: React.ReactNode }) => {
  return (
    <div className="bg-black text-white opacity-80 w-full py-6 px-2 font-bold border-1 border-white mb-2 flex justify-center items-center">
      {props.children}
    </div>
  )
}
