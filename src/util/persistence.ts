import { createLocalStorageAdapter } from '@thehult/dartgames-react'

/** Stores the running match's game log in sessionStorage. */
export const matchAdapter = createLocalStorageAdapter({
  prefix: 'dartventure:',
  storage: window.sessionStorage,
})
