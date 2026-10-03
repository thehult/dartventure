import { describe, expect, it } from 'vitest'
import { validateScenes } from './validate'
import { scenes } from '.'
import type { Scene } from '@/types/Scene'
import { gameIds } from '@/games/registry'

describe('scene content', () => {
  it('loads every scene', () => {
    expect(Object.keys(scenes).sort()).toEqual([
      'club',
      'district',
      'home',
      'nationals',
      'pub',
      'worlds',
    ])
  })

  it('has no errors', () => {
    expect(validateScenes(scenes, gameIds())).toEqual([])
  })
})

describe('validateScenes', () => {
  const broken: Scene = {
    background: 'bg.png',
    characters: { bob: { name: 'Bob' } },
    actions: [
      {
        name: 'Go',
        icon: 'i.png',
        description: 'd',
        action: 'navigate',
        sceneId: 'nowhere',
      },
      {
        name: 'Cup',
        icon: 'i.png',
        description: 'd',
        visible: 'completed("missing")',
        enabled: 'reputation >=',
        action: 'tournament',
        options: { players: 6, gameId: 'cricket' },
      },
    ],
    stories: [
      {
        name: 'a',
        script: [
          { character: 'alice' },
          { goto: 'nolabel' },
          { dialogue: 'hi', choice: [] } as never,
        ],
      },
      { name: 'a', script: [] },
    ],
  }

  it('catches broken references and invalid values', () => {
    const errors = validateScenes({ test: broken }, ['x01']).join('\n')
    expect(errors).toContain('unknown scene "nowhere"')
    expect(errors).toContain('unknown story "missing"')
    expect(errors).toContain('invalid condition "reputation >="')
    expect(errors).toContain('must be a power of two, got 6')
    expect(errors).toContain('unknown game "cricket"')
    expect(errors).toContain('unknown character "alice"')
    expect(errors).toContain('unknown label "nolabel"')
    expect(errors).toContain('expected exactly one step type')
    expect(errors).toContain('story name is already used')
  })
})
