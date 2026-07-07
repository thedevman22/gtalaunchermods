import LoginPage from '@renderer/pages/LoginPage'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export default function AuthModal({ open, onClose }: AuthModalProps): React.JSX.Element | null {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-launcher-bg/80 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in"
          className="absolute -right-1 -top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-launcher-border bg-launcher-surface text-launcher-muted transition-colors hover:text-launcher-text"
        >
          ×
        </button>
        <LoginPage embedded onClose={onClose} />
      </div>
    </div>
  )
}
