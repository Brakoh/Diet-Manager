import { DAY_IDS, identityAssignment, isValidAssignment, MEAL_IDS } from '../data/days'
import type { Checks, MealId, Meta, Persisted, Plan, WaterLog } from '../types'

export const STORAGE_KEY = 'diet-manager-v1'
export const WATER_MAX_ML = 10000

const emptyMeta: Meta = {
  patient: '',
  nutritionist: '',
  planDate: '',
  notes: '',
  sourceName: '',
  importedAt: null,
}

function isPlan(value: unknown): value is Plan {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return DAY_IDS.every((dayId) => {
    const meals = record[dayId]
    if (!meals || typeof meals !== 'object') return false
    const mealRecord = meals as Record<string, unknown>
    return MEAL_IDS.every((mealId) => typeof mealRecord[mealId] === 'string' && mealRecord[mealId])
  })
}

function cleanChecks(value: unknown): Checks {
  if (!value || typeof value !== 'object') return {}
  const next: Checks = {}
  for (const [date, meals] of Object.entries(value as Record<string, unknown>)) {
    if (!meals || typeof meals !== 'object') continue
    const day: Partial<Record<MealId, boolean>> = {}
    for (const mealId of MEAL_IDS) {
      if ((meals as Record<string, unknown>)[mealId] === true) day[mealId] = true
    }
    if (Object.keys(day).length) next[date] = day
  }
  return next
}

function cleanWater(value: unknown): WaterLog {
  if (!value || typeof value !== 'object') return {}
  const next: WaterLog = {}
  for (const [date, amount] of Object.entries(value as Record<string, unknown>)) {
    if (typeof amount === 'number' && Number.isFinite(amount)) {
      next[date] = Math.max(0, Math.min(WATER_MAX_ML, Math.round(amount)))
    }
  }
  return next
}

function cleanMeta(value: unknown): Meta {
  const record = value && typeof value === 'object' ? (value as Partial<Meta>) : {}
  return {
    patient: typeof record.patient === 'string' ? record.patient : '',
    nutritionist: typeof record.nutritionist === 'string' ? record.nutritionist : '',
    planDate: typeof record.planDate === 'string' ? record.planDate : '',
    notes: typeof record.notes === 'string' ? record.notes : '',
    sourceName: typeof record.sourceName === 'string' ? record.sourceName : '',
    importedAt: typeof record.importedAt === 'string' ? record.importedAt : null,
  }
}

export function createEmptyState(): Persisted {
  return {
    version: 1,
    plan: null,
    assignment: identityAssignment(),
    checks: {},
    water: {},
    meta: emptyMeta,
  }
}

export function normalizeState(value: unknown): Persisted {
  if (!value || typeof value !== 'object') return createEmptyState()
  const record = value as Partial<Persisted>
  if (record.version !== 1) return createEmptyState()
  if (record.plan == null) return { ...createEmptyState(), water: cleanWater(record.water) }
  if (!isPlan(record.plan)) return createEmptyState()
  return {
    version: 1,
    plan: record.plan,
    assignment: isValidAssignment(record.assignment) ? record.assignment : identityAssignment(),
    checks: cleanChecks(record.checks),
    water: cleanWater(record.water),
    meta: cleanMeta(record.meta),
  }
}

export function loadState(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyState()
    return normalizeState(JSON.parse(raw))
  } catch {
    return createEmptyState()
  }
}

export function saveState(state: Persisted): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
