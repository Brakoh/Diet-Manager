import { DAY_IDS, dayById, MEAL_IDS } from '../data/days'
import { dayIdFromToken } from './dates'
import { normalizeText } from './text'
import type { DayId, MealId, Plan } from '../types'

export type ParsedPlan = {
  complete: boolean
  plan: Plan | null
  notes: string
  patient: string | null
  planDate: string | null
  nutritionist: string | null
  warnings: string[]
}

const DAY_PATTERN = /luned[iì]|marted[iì]|mercoled[iì]|gioved[iì]|venerd[iì]|sabato|domenica/gi

function mealArticle(mealId: MealId): string {
  if (mealId === 'pranzo') return 'il pranzo'
  if (mealId === 'spuntino') return 'lo spuntino'
  return `la ${mealId}`
}
const MEAL_PATTERN = /(colazione|pranzo|spuntino|cena)\s*:/gi

function emptyMeals(): Partial<Record<MealId, string>> {
  return {}
}

export function parsePlanText(raw: string): ParsedPlan {
  const text = raw.replace(/\u00a0/g, ' ')
  const warnings: string[] = []
  const noteMatch = text.match(/\bNOTE\s*:/i)
  const notes = noteMatch ? normalizeText(text.slice((noteMatch.index ?? 0) + noteMatch[0].length)) : ''
  const body = noteMatch ? text.slice(0, noteMatch.index) : text

  const days: Partial<Record<DayId, Partial<Record<MealId, string>>>> = {}
  const dayRe = new RegExp(DAY_PATTERN.source, 'gi')
  const matches = [...body.matchAll(dayRe)]

  matches.forEach((match, index) => {
    const token = match[0]
    const dayId = dayIdFromToken(token)
    if (!dayId) return
    if (days[dayId]) warnings.push(`${dayById(dayId).label} compare più di una volta: tengo l’ultima.`)
    const start = (match.index ?? 0) + token.length
    const end = matches[index + 1]?.index ?? body.length
    const chunk = body.slice(start, end)
    const meals = emptyMeals()
    const mealRe = new RegExp(MEAL_PATTERN.source, 'gi')
    const mealMatches = [...chunk.matchAll(mealRe)]
    mealMatches.forEach((mealMatch, mealIndex) => {
      const mealId = mealMatch[1].toLowerCase() as MealId
      const from = (mealMatch.index ?? 0) + mealMatch[0].length
      const to = mealMatches[mealIndex + 1]?.index ?? chunk.length
      const content = normalizeText(chunk.slice(from, to))
      if (content) meals[mealId] = content
    })
    days[dayId] = meals
  })

  for (const dayId of DAY_IDS) {
    const meals = days[dayId]
    if (!meals) {
      warnings.push(`Manca ${dayById(dayId).label} nel file.`)
      continue
    }
    for (const mealId of MEAL_IDS) {
      if (!meals[mealId]) warnings.push(`Manca ${mealArticle(mealId)} di ${dayById(dayId).label}.`)
    }
  }

  const complete = DAY_IDS.every((dayId) => MEAL_IDS.every((mealId) => Boolean(days[dayId]?.[mealId])))
  let plan: Plan | null = null
  if (complete) {
    plan = {} as Plan
    for (const dayId of DAY_IDS) {
      plan[dayId] = {
        colazione: days[dayId]!.colazione!,
        pranzo: days[dayId]!.pranzo!,
        spuntino: days[dayId]!.spuntino!,
        cena: days[dayId]!.cena!,
      }
    }
  }

  const header = body.slice(0, matches[0]?.index ?? 0)
  const patientMatch = header.match(/PER:\s*([^\n]+)/i)
  const dateMatch = text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/)
  const nutritionistMatch = header.match(/Dott\.ssa[^\n]+/i)

  return {
    complete,
    plan,
    notes,
    patient: patientMatch ? normalizeText(patientMatch[1]) : null,
    planDate: dateMatch?.[1] ?? null,
    nutritionist: nutritionistMatch ? normalizeText(nutritionistMatch[0]) : null,
    warnings: warnings.filter((warning) => (complete ? !warning.startsWith('Manca') : true)),
  }
}
