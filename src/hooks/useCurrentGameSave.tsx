import { useSessionStorage } from 'usehooks-ts'

export function useCurrentGameSave() {
  const [currentGameSave, setCurrentGameSave] = useSessionStorage<
    string | null
  >('currentGameSave', null)

  return { currentGameSave, setCurrentGameSave }
}
