export default function LiquidBlobBackground(): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="liquid-blob liquid-blob-a" />
      <div className="liquid-blob liquid-blob-b" />
      <div className="liquid-blob liquid-blob-c" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-launcher-bg/20 to-launcher-bg/80" />
    </div>
  )
}
