export default function StoqviaLogo({ size = 32, showWordmark = true, className = '', light = false }) {
  return (
    <div className={`stoqvia-brand-lockup ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {/* Precision Geometric Inventory & Connected Operations Symbol */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="stoqvia-grad-primary" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4AF37" />
            <stop offset="0.6" stopColor="#B8860B" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
        </defs>

        {/* Outer Squircle Container */}
        <rect width="40" height="40" rx="10" fill="url(#stoqvia-grad-primary)" />

        {/* Isometric Connected Stock Hexagon/Cube */}
        {/* Top Face */}
        <path
          d="M20 9L30 14.5L20 20L10 14.5L20 9Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />
        {/* Left Face */}
        <path
          d="M10 16.5L19 21.5V31L10 26V16.5Z"
          fill="#FFFFFF"
          fillOpacity="0.75"
        />
        {/* Right Face */}
        <path
          d="M21 21.5L30 16.5V26L21 31V21.5Z"
          fill="#FFFFFF"
          fillOpacity="0.88"
        />

        {/* Central Intelligence Pulse Core */}
        <circle cx="20" cy="20" r="3.2" fill="#14B8A6" />
        <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" />
      </svg>

      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 800,
                fontSize: size >= 36 ? '20px' : '17px',
                letterSpacing: '-0.01em',
                color: light ? '#FFFFFF' : 'var(--ink, #F4F4F5)',
              }}
            >
              STOQVIA
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(212, 175, 55, 0.2)',
                color: light ? '#F3C74D' : 'var(--gold, #D4AF37)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              PRO
            </span>
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: light ? 'rgba(255,255,255,0.7)' : 'var(--muted, #A1A1AA)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Smart Inventory. Smarter Business.
          </span>
        </div>
      )}
    </div>
  )
}
