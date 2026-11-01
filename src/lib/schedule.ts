import { useEffect, useState } from 'react'
import type { MealId } from '../types'

export const MEAL_CUTOFF_HOUR: Record<MealId, number> = {
  colazione: 10,
  pranzo: 14,
  spuntino: 17,
  cena: 21,
}

export function formatMealCutoff(meal: MealId): string {
  return `${String(MEAL_CUTOFF_HOUR[meal]).padStart(2, '0')}:00`
}

export function isMealDue(day: Date, meal: MealId, now = new Date()): boolean {
  const cutoff = new Date(day)
  cutoff.setHours(MEAL_CUTOFF_HOUR[meal], 0, 0, 0)
  return now.getTime() >= cutoff.getTime()
}

export function isMealComplete(day: Date, meal: MealId, manual: boolean, now = new Date()): boolean {
  return manual || isMealDue(day, meal, now)
}

export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = window.setInterval(tick, intervalMs)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [intervalMs])
  return now
}
