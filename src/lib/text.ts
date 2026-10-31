export function normalizeText(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(rounded)
}

export function formatGrams(value: number): string {
  return `${formatNumber(value)} g`
}

export function formatLiters(ml: number): string {
  return `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 }).format(ml / 1000)} L`
}
