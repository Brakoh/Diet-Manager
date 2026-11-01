type IconProps = { size?: number }

function svg(size = 22) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }
}

export function IconToday({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" />
    </svg>
  )
}

export function IconSwap({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <path d="M7 7h11" />
      <path d="M15 4.5 18 7l-3 2.5" />
      <path d="M17 17H6" />
      <path d="M9 14.5 6 17l3 2.5" />
    </svg>
  )
}

export function IconShop({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <path d="M6.5 8h11l-.8 11.5a1.5 1.5 0 0 1-1.5 1.4H8.8a1.5 1.5 0 0 1-1.5-1.4L6.5 8z" />
      <path d="M9 8V6.2A3 3 0 0 1 12 3.2 3 3 0 0 1 15 6.2V8" />
    </svg>
  )
}

export function IconFile({ size }: IconProps) {
  return (
    <svg {...svg(size)}>
      <path d="M7 3.5h6.5L19 9v11a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V5a1.5 1.5 0 0 1 1-1.5z" />
      <path d="M13.5 3.5V9H19" />
      <path d="M12 12.5v6" />
      <path d="M9.5 15 12 12.5 14.5 15" />
    </svg>
  )
}

export function IconCheck({ size = 16 }: IconProps) {
  return (
    <svg {...svg(size)}>
      <path d="M5 12.5 9.2 17 19 7" />
    </svg>
  )
}
