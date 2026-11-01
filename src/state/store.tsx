import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { identityAssignment } from '../data/days'
import { WATER_MAX_ML, loadState, saveState } from '../lib/storage'
import type { DayId, MealId, Meta, Persisted, Plan } from '../types'

type DietContextValue = {
  state: Persisted
  persistWarning: boolean
  toggleMeal: (date: string, meal: MealId) => void
  setWater: (date: string, ml: number) => void
  swapDays: (a: DayId, b: DayId) => void
  resetAssignment: () => void
  toggleGrocery: (id: string) => void
  resetGrocery: () => void
  applyPlan: (plan: Plan, meta: Meta) => void
}

const DietContext = createContext<DietContextValue | null>(null)

export function DietProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => loadState())
  const [persistWarning, setPersistWarning] = useState(false)

  useEffect(() => {
    setPersistWarning(!saveState(state))
  }, [state])

  const value = useMemo<DietContextValue>(
    () => ({
      state,
      persistWarning,
      toggleMeal: (date, meal) => {
        setState((current) => {
          const day = { ...current.checks[date] }
          day[meal] = !day[meal]
          if (!day[meal]) delete day[meal]
          const checks = { ...current.checks }
          if (Object.keys(day).length) checks[date] = day
          else delete checks[date]
          return { ...current, checks }
        })
      },
      setWater: (date, ml) => {
        const amount = Math.max(0, Math.min(WATER_MAX_ML, Math.round(ml)))
        setState((current) => {
          const water = { ...current.water }
          if (amount === 0) delete water[date]
          else water[date] = amount
          return { ...current, water }
        })
      },
      swapDays: (a, b) => {
        if (a === b) return
        setState((current) => {
          const assignment = { ...current.assignment }
          const sourceA = assignment[a]
          const sourceB = assignment[b]
          assignment[a] = sourceB
          assignment[b] = sourceA
          return { ...current, assignment }
        })
      },
      resetAssignment: () => {
        setState((current) => ({ ...current, assignment: identityAssignment() }))
      },
      toggleGrocery: (id) => {
        setState((current) => {
          const has = current.grocery.includes(id)
          const grocery = has ? current.grocery.filter((item) => item !== id) : [id, ...current.grocery]
          return { ...current, grocery }
        })
      },
      resetGrocery: () => {
        setState((current) => ({ ...current, grocery: [] }))
      },
      applyPlan: (plan, meta) => {
        setState((current) => ({
          ...current,
          plan,
          meta,
          assignment: identityAssignment(),
          checks: {},
        }))
      },
    }),
    [persistWarning, state],
  )

  return <DietContext.Provider value={value}>{children}</DietContext.Provider>
}

export function useDiet() {
  const context = useContext(DietContext)
  if (!context) throw new Error('useDiet richiede DietProvider')
  return context
}
