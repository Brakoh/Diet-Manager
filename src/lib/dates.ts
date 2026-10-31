import { DAY_IDS } from '../data/days'
import type { DayId } from '../types'

export function isoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIndex(ref = new Date()): number {
  const js = ref.getDay()
  return js === 0 ? 6 : js - 1
}

export function dateForDayIndex(index: number, ref = new Date()): Date {
  const anchor = new Date(ref)
  anchor.setHours(12, 0, 0, 0)
  const mondayOffset = anchor.getDay() === 0 ? -6 : 1 - anchor.getDay()
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() + mondayOffset)
  const result = new Date(monday)
  result.setDate(monday.getDate() + index)
  return result
}

export function formatDayMonth(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' })
    .format(date)
    .replace('.', '')
}

export function dayIdFromToken(token: string): DayId | null {
  const value = token.toLowerCase()
  if (value.startsWith('lun')) return 'lun'
  if (value.startsWith('mar')) return 'mar'
  if (value.startsWith('mer')) return 'mer'
  if (value.startsWith('gio')) return 'gio'
  if (value.startsWith('ven')) return 'ven'
  if (value.startsWith('sab')) return 'sab'
  if (value.startsWith('dom')) return 'dom'
  return null
}

export function indexOfDay(id: DayId): number {
  return DAY_IDS.indexOf(id)
}
