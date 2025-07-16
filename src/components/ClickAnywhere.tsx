import React from 'react'
import { useClickAnyWhere } from 'usehooks-ts'

interface ClickAnywhereProps {
  onClick?: () => void
  children?: React.ReactNode
}

const ClickAnywhere: React.FC<ClickAnywhereProps> = ({ onClick, children }) => {
  useClickAnyWhere(() => onClick?.())
  return children
}

export default ClickAnywhere
