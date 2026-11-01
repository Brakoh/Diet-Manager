import { DAYS, dayById, MEALS } from '../data/days'
import { dateForDayIndex, formatDayMonth, isoDate, todayIndex } from '../lib/dates'
import { isMealComplete, useNow } from '../lib/schedule'
import { WATER_MAX_ML } from '../lib/storage'
import { formatLiters } from '../lib/text'
import type { MealId } from '../types'
import { useDiet } from '../state/store'
import { DottedRing } from './DottedRing'
import { IconCheck, IconSwap } from './icons'

const GLASS_ML = 250
const GOAL_ML = 2000
const GLASS_COUNT = GOAL_ML / GLASS_ML

type DashboardProps = {
  dayIndex: number
  onDayIndex: (index: number) => void
  onSwap: () => void
  onNotes: () => void
  onMeal: (meal: MealId) => void
}

export function Dashboard({ dayIndex, onDayIndex, onSwap, onNotes, onMeal }: DashboardProps) {
  const { state, setWater } = useDiet()
  const now = useNow()
  const plan = state.plan
  if (!plan) return null
  const today = todayIndex(now)
  const date = dateForDayIndex(dayIndex, now)
  const dateKey = isoDate(date)
  const day = DAYS[dayIndex]
  const sourceId = state.assignment[day.id]
  const source = dayById(sourceId)
  const swapped = sourceId !== day.id
  const meals = plan[sourceId]
  const checks = state.checks[dateKey] ?? {}
  const completeMeal = (mealId: MealId) => isMealComplete(date, mealId, Boolean(checks[mealId]), now)
  const done = MEALS.filter((meal) => completeMeal(meal.id)).length
  const water = state.water[dateKey] ?? 0
  const glasses = Math.round(water / GLASS_ML)

  return (
    <div className="view" data-testid="dashboard">
      <header className="topbar">
        <span className="logo" aria-hidden="true" />
        <div className="brand-block">
          <p className="eyebrow">Piano alimentare</p>
          <p className="brand">{state.meta.patient || 'Il tuo piano'}</p>
        </div>
        <button type="button" className="note-link" onClick={onNotes}>
          Note
        </button>
      </header>

      <div className="week" role="group" aria-label="Giorni della settimana">
        {DAYS.map((item, index) => {
          const itemSource = state.assignment[item.id]
          const moved = itemSource !== item.id
          const selected = index === dayIndex
          return (
            <button
              key={item.id}
              type="button"
              className={`day${selected ? ' is-selected' : ''}${index === today ? ' is-today' : ''}${moved ? ' is-swapped' : ''}`}
              aria-pressed={selected}
              aria-label={moved ? `${item.label}, piano di ${dayById(itemSource).label}` : item.label}
              onClick={() => onDayIndex(index)}
            >
              {item.short}
            </button>
          )
        })}
      </div>

      <section className="hero" data-testid="hero">
        <div className="hero-top">
          <div className="hero-copy">
            <p className="eyebrow">{dayIndex === today ? 'Oggi' : 'Giorno'} · {formatDayMonth(date)}</p>
            <h1>{day.label}</h1>
            <p className="hero-status">{done === 4 ? 'Giornata completa' : `${done} su 4 pasti`}</p>
            {swapped ? <p className="hero-plan">Piano di {source.label}</p> : null}
          </div>
          <DottedRing
            value={done / 4}
            size={80}
            dots={28}
            color="#0D0D0E"
            track="rgba(13,13,14,0.22)"
            thickness={3.6}
            label={`${done} pasti su 4`}
            center={
              <span className="ring-fraction">
                {done}
                <small>/4</small>
              </span>
            }
          />
        </div>
        <button type="button" className="hero-action" data-testid="swap-open" onClick={onSwap}>
          <IconSwap size={18} />
          Scambia giornata
        </button>
      </section>

      <div className="section-head">
        <h2>Pasti</h2>
      </div>

      <div className="meal-grid">
        {MEALS.map((meal) => {
          const complete = completeMeal(meal.id)
          return (
            <button
              key={meal.id}
              type="button"
              className={complete ? 'meal is-done' : 'meal'}
              aria-label={complete ? `${meal.label}, fatto` : meal.label}
              onClick={() => onMeal(meal.id)}
            >
              <span className="ring-btn" aria-hidden="true">
                <DottedRing
                  value={complete ? 1 : 0}
                  size={48}
                  dots={22}
                  color="#CCFF00"
                  track="#2C2C2E"
                  thickness={3}
                  center={complete ? <IconCheck /> : null}
                />
              </span>
              <span className="meal-name">{meal.label}</span>
              <span className="meal-lead">{meals[meal.id]}</span>
            </button>
          )
        })}
      </div>

      <section className="card water" aria-label="Acqua">
        <p className={water >= GOAL_ML ? 'eyebrow is-done' : 'eyebrow'}>
          <span>{water >= GOAL_ML ? 'Fatto' : 'Acqua'}</span>
        </p>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setWater(dateKey, water - GLASS_ML)}
          disabled={water === 0}
          aria-label="Togli 250 ml"
        >
          −
        </button>
        <div className="glasses" aria-hidden="true">
          {Array.from({ length: GLASS_COUNT }, (_, index) => (
            <span key={index} className={index < Math.min(glasses, GLASS_COUNT) ? 'glass is-on' : 'glass'} />
          ))}
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setWater(dateKey, water + GLASS_ML)}
          disabled={water >= WATER_MAX_ML}
          aria-label="Aggiungi 250 ml"
          data-testid="water-plus"
        >
          +
        </button>
        <p className="water-value" aria-live="polite">
          <span>{formatLiters(water)}</span>
        </p>
      </section>

      </div>
  )
}
