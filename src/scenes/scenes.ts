import WorldScene from '@/scenes/world.yml'
import PubScene from '@/scenes/pub.yml'

export const scenes = {
  world: WorldScene,
  pub: PubScene,
}

export type SceneId = keyof typeof scenes
