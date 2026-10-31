import type { ReactNode } from 'react'

type DottedRingProps = {
  value: number
  size?: number
  dots?: number
  color?: string
  track?: string
  thickness?: number
  center?: ReactNode
  label?: string
}

export function DottedRing({
  value,
  size = 96,
  dots = 32,
  color = '#CCFF00',
  track = '#2C2C2E',
  thickness = 3.4,
  center,
  label,
}: DottedRingProps) {
  const cx = size / 2
  const cy = size / 2
  const outer = size / 2 - thickness
  const inner = outer - Math.max(5, size * 0.072)
  const filled = Math.round(Math.max(0, Math.min(1, value)) * dots)

  return (
    <div
      className="ring"
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: dots }, (_, index) => {
          const angle = (index / dots) * Math.PI * 2 - Math.PI / 2
          const cosine = Math.cos(angle)
          const sine = Math.sin(angle)
          return (
            <line
              key={index}
              x1={cx + cosine * inner}
              y1={cy + sine * inner}
              x2={cx + cosine * outer}
              y2={cy + sine * outer}
              stroke={index < filled ? color : track}
              strokeWidth={thickness}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      {center ? <span className="ring-center">{center}</span> : null}
    </div>
  )
}
