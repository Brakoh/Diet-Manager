import type { Assignment, DayId, MealId } from '../types'

export const DAY_IDS: DayId[] = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']

export const DAYS: { id: DayId; label: string; short: string }[] = [
  { id: 'lun', label: 'Lunedì', short: 'Lu' },
  { id: 'mar', label: 'Martedì', short: 'Ma' },
  { id: 'mer', label: 'Mercoledì', short: 'Me' },
  { id: 'gio', label: 'Giovedì', short: 'Gi' },
  { id: 'ven', label: 'Venerdì', short: 'Ve' },
  { id: 'sab', label: 'Sabato', short: 'Sa' },
  { id: 'dom', label: 'Domenica', short: 'Do' },
]

export const MEALS: { id: MealId; label: string }[] = [
  { id: 'colazione', label: 'Colazione' },
  { id: 'pranzo', label: 'Pranzo' },
  { id: 'spuntino', label: 'Spuntino' },
  { id: 'cena', label: 'Cena' },
]

export const MEAL_IDS: MealId[] = MEALS.map((meal) => meal.id)

export function identityAssignment(): Assignment {
  return {
    lun: 'lun',
    mar: 'mar',
    mer: 'mer',
    gio: 'gio',
    ven: 'ven',
    sab: 'sab',
    dom: 'dom',
  }
}

export function dayById(id: DayId) {
  return DAYS.find((day) => day.id === id) ?? DAYS[0]
}

export function isDayId(value: unknown): value is DayId {
  return typeof value === 'string' && DAY_IDS.includes(value as DayId)
}

export function isValidAssignment(value: unknown): value is Assignment {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  const seen = new Set<string>()
  for (const id of DAY_IDS) {
    const target = record[id]
    if (!isDayId(target) || seen.has(target)) return false
    seen.add(target)
  }
  return true
}
