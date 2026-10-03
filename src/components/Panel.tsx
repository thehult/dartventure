type PanelProps = {
  title: string
  onClose: () => void
  children?: React.ReactNode
}

/** A screen laid over the scene. Clicking outside of it closes it. */
export const Panel: React.FC<PanelProps> = ({ title, onClose, children }) => (
  <div
    className="absolute inset-0 z-[60] flex overflow-y-auto bg-black/60"
    onClick={onClose}
  >
    <div
      role="dialog"
      aria-label={title}
      className="m-auto w-full max-w-lg mx-2 my-12 short:my-10 p-4 short:p-2 bg-black/85 text-white border-1 border-white"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold mb-3 short:mb-1">{title}</h2>
      {children}
      <button
        type="button"
        className="mt-4 short:mt-2 w-full py-3 short:py-1 bg-(--alternative-color) rounded-sm font-semibold hover:bg-(--secondary-color) cursor-pointer transition"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
)
