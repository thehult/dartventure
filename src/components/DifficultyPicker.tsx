import type { Difficulty } from '@/engine/difficulty'
import { DIFFICULTIES, DIFFICULTY_ORDER } from '@/engine/difficulty'

type DifficultyPickerProps = {
  value: Difficulty
  onChange: (difficulty: Difficulty) => void
}

/** Buttons for choosing a difficulty, with a description of the chosen one. */
export const DifficultyPicker: React.FC<DifficultyPickerProps> = ({
  value,
  onChange,
}) => (
  <>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {DIFFICULTY_ORDER.map((d) => (
        <button
          key={d}
          type="button"
          aria-pressed={value === d}
          className={`py-2 short:py-1 border-1 cursor-pointer transition ${
            value === d
              ? 'bg-(--primary-color) text-black border-(--primary-color)'
              : 'border-white/50 hover:bg-white/10'
          }`}
          onClick={() => onChange(d)}
        >
          {DIFFICULTIES[d].name}
        </button>
      ))}
    </div>
    <p className="text-sm text-white/80 mt-2 short:mt-1 min-h-10 short:min-h-0">
      {DIFFICULTIES[value].description}
    </p>
  </>
)
