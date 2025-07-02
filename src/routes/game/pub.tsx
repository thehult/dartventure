import { Background } from '@/components/Background'
import { createFileRoute } from '@tanstack/react-router'

import BackgroundImage from '@/assets/scenes/pub/background.png'
import BartenderImage from '@/assets/scenes/pub/bartender.png'
import { Character } from '@/components/Character'
import { useState } from 'react'
import { Dialogue } from '@/components/Dialogue'
import { Menu, MenuItem } from '@/components/Menu'

export const Route = createFileRoute('/game/pub')({
  component: PubComponent,
})

function PubComponent() {
  const [visible, setVisible] = useState(false)

  return (
    <Background background={BackgroundImage}>
      <button
        onClick={() => setVisible(!visible)}
        className="absolute top-0 left-0 z-10 p-2 m-2 text-white bg-black rounded"
      >
        Bring in
      </button>
      <Character image={BartenderImage} visible={visible} />
      <Dialogue speaker="bartender" visible={visible}>
        Welcome to my pub.
      </Dialogue>
      {/* <Menu>
        <MenuItem>Test 1</MenuItem>
        <MenuItem>Test 2</MenuItem>
      </Menu> */}
    </Background>
  )
}
