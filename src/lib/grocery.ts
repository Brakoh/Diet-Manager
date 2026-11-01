import { DAY_IDS, MEAL_IDS } from '../data/days'
import { GROCERY_CATALOG, locateCatalog, type GroceryCategoryId } from '../data/groceryCatalog'
import type { Assignment, DayId, MealId, Plan } from '../types'
import { splitIngredients } from './ingredients'
import { formatNumber, normalizeText } from './text'

export type Portion =
  | { kind: 'measure'; amount: number; unit: 'g' | 'ml' }
  | { kind: 'range'; min: number; max: number; unit: 'g' | 'ml' }
  | { kind: 'count'; text: string }

export type GroceryAlt = {
  id: string
  label: string
  portion: Portion | null
}

export type GroceryMeal = {
  portion: Portion | null
  alternatives: GroceryAlt[]
}

export type GroceryDay = {
  portion: Portion | null
  alternatives: GroceryAlt[]
  meals: Partial<Record<MealId, GroceryMeal>>
}

export type GroceryItem = {
  id: string
  label: string
  category: GroceryCategoryId
  days: DayId[]
  byDay: Partial<Record<DayId, GroceryDay>>
  alternatives: string[]
}

const catalogById = new Map(GROCERY_CATALOG.map((item) => [item.id, item]))

function slug(label: string): string {
  return label
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function leftoverLabel(part: string): string | null {
  let text = normalizeText(part)
  text = text.replace(/\([^)]*\)/g, ' ')
  text = text.replace(/\d+(?:[.,]\d+)?\s*(?:g|gr|ml|kg)\b/gi, ' ')
  text = text.replace(/\b\d+\s*(?:cucchiai|cucchiaio|cucchiaini|cucchiaino|fette|fetta|confezioni|confezione|scatolette|scatole|scatoletta)\b/gi, ' ')
  text = text.replace(/^(?:pancakes|pancake)\s*:\s*/i, '')
  text = text.replace(/^\d+\s+/, '')
  text = text.replace(/\s+/g, ' ').trim()
  text = text.replace(/^[\s\-–:,]+|[\s\-–:,]+$/g, '')
  if (text.length < 3) return null
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function parseNumber(value: string): number {
  return Number(value.replace(',', '.'))
}

function readMeasure(slice: string): Portion | null {
  const matches = [
    ...slice.matchAll(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(g|ml)\b/gi),
  ]
  const match = matches.at(-1)
  if (!match) return null
  const unit = match[3].toLowerCase() === 'ml' ? 'ml' : 'g'
  if (match[2]) {
    return { kind: 'range', min: parseNumber(match[1]), max: parseNumber(match[2]), unit }
  }
  return { kind: 'measure', amount: parseNumber(match[1]), unit }
}

function readCount(slice: string): Portion | null {
  const matches = [...slice.matchAll(/(\d+)\s*(scatolette|scatoletta|uova|uovo|fette|fetta)?/gi)]
  const match = matches.at(-1)
  if (!match) return null
  const text = match[2] ? `${match[1]} ${match[2].toLowerCase()}` : match[1]
  return { kind: 'count', text }
}

function portionAround(text: string, start: number, end: number, previousEnd: number): Portion | null {
  const after = text.slice(end, end + 28)
  const paren = after.match(/^\s*\((?!\s*o\b)[^)]*?(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(g|ml)\b/i)
  if (paren) {
    const unit = paren[3].toLowerCase() === 'ml' ? 'ml' : 'g'
    if (paren[2]) return { kind: 'range', min: parseNumber(paren[1]), max: parseNumber(paren[2]), unit }
    return { kind: 'measure', amount: parseNumber(paren[1]), unit }
  }
  const before = text.slice(previousEnd, start)
  return readMeasure(before) ?? readCount(before)
}

function isAlternative(between: string): boolean {
  const lower = between.toLowerCase()
  const orAt = Math.max(lower.lastIndexOf(' o '), lower.lastIndexOf('(o '))
  const andAt = Math.max(lower.lastIndexOf(' con '), lower.lastIndexOf(' e '))
  return orAt !== -1 && orAt > andAt
}

function mergePortion(current: Portion | null, next: Portion | null): Portion | null {
  if (!next) return current
  if (!current) return next
  if (current.kind === 'measure' && next.kind === 'measure' && current.unit === next.unit) {
    return { kind: 'measure', amount: current.amount + next.amount, unit: current.unit }
  }
  return current
}

export function formatPortion(portion: Portion | null): string | null {
  if (!portion) return null
  if (portion.kind === 'count') return portion.text
  if (portion.kind === 'range') return `${formatNumber(portion.min)}–${formatNumber(portion.max)} ${portion.unit}`
  return `${formatNumber(portion.amount)} ${portion.unit}`
}

type Draft = {
  id: string
  label: string
  category: GroceryCategoryId
  byDay: Partial<Record<DayId, GroceryDay>>
}

function ensureDay(draft: Draft, day: DayId): GroceryDay {
  const current = draft.byDay[day]
  if (current) return current
  const created: GroceryDay = { portion: null, alternatives: [], meals: {} }
  draft.byDay[day] = created
  return created
}

function ensureMeal(draft: Draft, day: DayId, meal: MealId): GroceryMeal {
  const slot = ensureDay(draft, day)
  const current = slot.meals[meal]
  if (current) return current
  const created: GroceryMeal = { portion: null, alternatives: [] }
  slot.meals[meal] = created
  return created
}

function absorbPart(part: string, day: DayId, meal: MealId, drafts: Map<string, Draft>) {
  const text = normalizeText(part)
  const hits = locateCatalog(text)
  if (hits.length === 0) {
    const label = leftoverLabel(text)
    if (!label) return
    const id = `altro:${slug(label)}`
    const draft = drafts.get(id) ?? { id, label, category: 'altro', byDay: {} }
    ensureMeal(draft, day, meal)
    drafts.set(id, draft)
    return
  }

  let primaryId: string | null = null
  let primaryPortion: Portion | null = null
  hits.forEach((hit, index) => {
    const entry = catalogById.get(hit.id)
    if (!entry) return
    const previousEnd = index === 0 ? 0 : hits[index - 1].end
    const between = text.slice(previousEnd, hit.start)
    const ownPortion = portionAround(text, hit.start, hit.end, previousEnd)
    const alternative = index > 0 && isAlternative(between)
    if (!alternative || !primaryId) {
      primaryId = hit.id
      primaryPortion = ownPortion
      const draft = drafts.get(hit.id) ?? { id: hit.id, label: entry.label, category: entry.category, byDay: {} }
      const slot = ensureDay(draft, day)
      const mealSlot = ensureMeal(draft, day, meal)
      slot.portion = mergePortion(slot.portion, ownPortion)
      mealSlot.portion = mergePortion(mealSlot.portion, ownPortion)
      drafts.set(hit.id, draft)
      return
    }
    if (hit.id === primaryId) return
    const portion = ownPortion ?? primaryPortion
    const owner = drafts.get(primaryId)
    if (!owner) return
    const slot = ensureDay(owner, day)
    const mealSlot = ensureMeal(owner, day, meal)
    if (!slot.alternatives.some((item) => item.id === hit.id)) {
      slot.alternatives.push({ id: hit.id, label: entry.label, portion })
    }
    if (!mealSlot.alternatives.some((item) => item.id === hit.id)) {
      mealSlot.alternatives.push({ id: hit.id, label: entry.label, portion })
    }
  })
}

export function buildGrocery(plan: Plan, assignment: Assignment): GroceryItem[] {
  const drafts = new Map<string, Draft>()
  for (const day of DAY_IDS) {
    const meals = plan[assignment[day]]
    for (const mealId of MEAL_IDS) {
      for (const part of splitIngredients(meals[mealId])) absorbPart(part, day, mealId, drafts)
    }
  }

  const items: GroceryItem[] = []
  const ordered = [
    ...GROCERY_CATALOG.map((entry) => drafts.get(entry.id)).filter((item): item is Draft => Boolean(item)),
    ...[...drafts.values()].filter((item) => item.category === 'altro'),
  ]
  for (const draft of ordered) {
    const days = DAY_IDS.filter((day) => draft.byDay[day])
    const labels: string[] = []
    for (const day of days) {
      for (const alt of draft.byDay[day]?.alternatives ?? []) {
        if (!labels.includes(alt.label)) labels.push(alt.label)
      }
    }
    items.push({
      id: draft.id,
      label: draft.label,
      category: draft.category,
      days,
      byDay: draft.byDay,
      alternatives: labels,
    })
  }
  return items
}
