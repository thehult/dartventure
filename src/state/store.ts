import { useSyncExternalStore } from 'react'
import type { AnySave } from '@/engine/save'
import type { GameState } from '@/types/GameState'
import { CURRENT_VERSION, createGameState, migrateSave } from '@/engine/save'
import { repair } from '@/engine/flow'

/**
 * Holds the open save. The whole `GameState` is one object persisted under
 * one key, and every change goes through `update`.
 */

export type SaveInfo = {
  id: string
  name: string
  createdAt: number
  latestLoad: number
}

const INDEX_KEY = 'gamesaves'
const CURRENT_SAVE_KEY = 'currentGameSave'
const saveKey = (id: string) => `gamesaves/${id}`
const backupKey = (id: string, version: number) =>
  `gamesaves/${id}/backup-v${version}`

/** Keys from before the game state was stored in the save. */
const LEGACY_KEYS = [
  'currentSceneState',
  'current-tournament',
  'current-match',
  'current-game-data',
  'undefined_backup',
]

const read = <T>(storage: Storage, key: string): T | null => {
  try {
    const value = storage.getItem(key)
    return value === null ? null : (JSON.parse(value) as T)
  } catch (error) {
    console.error(`Failed to read "${key}"`, error)
    return null
  }
}

const write = (storage: Storage, key: string, value: unknown) => {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to write "${key}"`, error)
  }
}

let saveId: string | null = null
let state: GameState | null = null
const listeners = new Set<() => void>()

const notify = () => listeners.forEach((listener) => listener())

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Most recently played first. */
export const listSaves = (): Array<SaveInfo> =>
  [...(read<Array<SaveInfo>>(localStorage, INDEX_KEY) ?? [])].sort(
    (a, b) => b.latestLoad - a.latestLoad,
  )

const writeIndex = (saves: Array<SaveInfo>) =>
  write(localStorage, INDEX_KEY, saves)

export const createSave = (playerName: string): string => {
  const id = Date.now().toString(16)
  const now = Date.now()
  writeIndex([
    ...listSaves(),
    { id, name: playerName, createdAt: now, latestLoad: now },
  ])
  write(localStorage, saveKey(id), createGameState(playerName))
  openSave(id)
  return id
}

/** Loads, migrates and opens a save. Returns false if it doesn't exist. */
export const openSave = (id: string): boolean => {
  const stored = read<AnySave>(localStorage, saveKey(id))
  if (!stored) return false

  if (stored.version !== CURRENT_VERSION) {
    write(localStorage, backupKey(id, stored.version), stored)
  }
  saveId = id
  state = repair(migrateSave(stored))
  write(localStorage, saveKey(id), state)
  write(sessionStorage, CURRENT_SAVE_KEY, id)
  writeIndex(
    listSaves().map((s) => (s.id === id ? { ...s, latestLoad: Date.now() } : s)),
  )
  notify()
  return true
}

/** Opens the save this tab was playing, e.g. after a reload. */
export const restoreSession = (): boolean => {
  if (state) return true
  const id = read<string>(sessionStorage, CURRENT_SAVE_KEY)
  return id !== null && openSave(id)
}

export const closeSave = () => {
  saveId = null
  state = null
  sessionStorage.removeItem(CURRENT_SAVE_KEY)
  notify()
}

export const getState = () => state

export const update = (transition: (current: GameState) => GameState) => {
  if (!state || !saveId) throw new Error('No save is open')
  const next = transition(state)
  if (next === state) return
  state = next
  write(localStorage, saveKey(saveId), state)
  notify()
}

export const removeLegacyKeys = () => {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

/** The open save's state. Only use below the `/game` route. */
export const useGameState = (): GameState => {
  const current = useSyncExternalStore(subscribe, getState)
  if (!current) throw new Error('useGameState used without an open save')
  return current
}
