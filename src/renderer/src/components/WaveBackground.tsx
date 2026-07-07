export default function WaveBackground(): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/80 via-white/40 to-cyan-50/60" />
      <svg
        className="wave-hero-layer absolute -bottom-4 left-0 h-[55%] w-[200%] opacity-60"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="wave-layer-a"
          fill="#7dd3fc"
          fillOpacity="0.35"
          d="M0 80 C300 120 500 40 800 90 C950 115 1100 70 1200 95 V200 H0 Z"
        />
        <path
          className="wave-layer-b"
          fill="#38bdf8"
          fillOpacity="0.25"
          d="M0 110 C250 85 450 130 700 100 C900 75 1050 125 1200 105 V200 H0 Z"
        />
        <path
          className="wave-layer-c"
          fill="#0ea5e9"
          fillOpacity="0.15"
          d="M0 140 C200 155 400 125 600 145 C800 165 1000 130 1200 150 V200 H0 Z"
        />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-launcher-surface/90 via-transparent to-transparent" />
    </div>
  )
}
