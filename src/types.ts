export type DayId = 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom'

export type MealId = 'colazione' | 'pranzo' | 'spuntino' | 'cena'

export type Plan = Record<DayId, Record<MealId, string>>

export type Assignment = Record<DayId, DayId>

export type Checks = Record<string, Partial<Record<MealId, boolean>>>

export type WaterLog = Record<string, number>

export type Meta = {
  patient: string
  nutritionist: string
  planDate: string
  notes: string
  sourceName: string
  importedAt: string | null
}

export type Persisted = {
  version: 1
  plan: Plan
  assignment: Assignment
  checks: Checks
  water: WaterLog
  meta: Meta
}

export type Category = 'cereali' | 'verdure' | 'legumi'
