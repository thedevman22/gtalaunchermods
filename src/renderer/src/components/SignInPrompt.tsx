interface SignInPromptProps {
  message: string
  onSignIn: () => void
  compact?: boolean
}

export default function SignInPrompt({
  message,
  onSignIn,
  compact = false
}: SignInPromptProps): React.JSX.Element {
  return (
    <div
      className={[
        'flex items-center gap-3 rounded-lg border border-launcher-border bg-launcher-elevated/50',
        compact ? 'px-3 py-2' : 'px-4 py-3'
      ].join(' ')}
    >
      <p className={compact ? 'flex-1 text-xs text-launcher-muted' : 'flex-1 text-sm text-launcher-muted'}>
        {message}
      </p>
      <button
        type="button"
        onClick={onSignIn}
        className="shrink-0 text-xs font-semibold text-launcher-accent transition-colors hover:text-launcher-text"
      >
        Sign in
      </button>
    </div>
  )
}
