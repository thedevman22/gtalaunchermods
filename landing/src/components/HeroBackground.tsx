export default function HeroBackground(): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="liquid-blob liquid-blob-a" />
      <div className="liquid-blob liquid-blob-b" />
      <div className="liquid-blob liquid-blob-c" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/30 to-bg/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,230,118,0.12),transparent)]" />
    </div>
  )
}
