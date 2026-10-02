import type { Scene, Story } from '@/types/Scene'

// Every .yml file in this folder is a scene, named after the file.
const modules = import.meta.glob<{ default: Scene }>('./*.yml', {
  eager: true,
})

export const scenes: Record<string, Scene | undefined> = Object.fromEntries(
  Object.entries(modules).map(([path, module]) => [
    path.replace(/^\.\/(.*)\.yml$/, '$1'),
    module.default,
  ]),
)

export const getScene = (sceneId: string): Scene => {
  const scene = scenes[sceneId]
  if (!scene) throw new Error(`Unknown scene "${sceneId}"`)
  return scene
}

export const findStory = (sceneId: string, name: string): Story | undefined =>
  scenes[sceneId]?.stories.find((s) => s.name === name)
