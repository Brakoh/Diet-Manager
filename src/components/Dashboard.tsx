import { DAYS, dayById, MEALS } from '../data/days'
import { dateForDayIndex, formatDayMonth, isoDate, todayIndex } from '../lib/dates'
import { formatLiters } from '../lib/text'
import type { MealId } from '../types'
import { useDiet } from '../state/store'
import { DottedRing } from './DottedRing'
import { IconCheck, IconSwap } from './icons'

const GLASS_ML = 250
const GOAL_ML = 2000

type DashboardProps = {
  dayIndex: number
  onDayIndex: (index: number) => void
  onSwap: () => void
  onNotes: () => void
  onMeal: (meal: MealId) => void
}

export function Dashboard({ dayIndex, onDayIndex, onSwap, onNotes, onMeal }: DashboardProps) {
  const { state, toggleMeal, setWater } = useDiet()
  const today = todayIndex()
  const date = dateForDayIndex(dayIndex)
  const dateKey = isoDate(date)
  const day = DAYS[dayIndex]
  const sourceId = state.assignment[day.id]
  const source = dayById(sourceId)
  const swapped = sourceId !== day.id
  const meals = state.plan[sourceId]
  const checks = state.checks[dateKey] ?? {}
  const done = MEALS.filter((meal) => checks[meal.id]).length
  const water = state.water[dateKey] ?? 0
  const glasses = Math.round(water / GLASS_ML)

  return (
    <div className="view" data-testid="dashboard">
      <header className="topbar">
        <span className="logo" aria-hidden="true" />
        <div className="brand-block">
          <p className="eyebrow">Piano alimentare</p>
          <p className="brand">Vittorio Borrello</p>
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

      {dayIndex !== today ? (
        <button type="button" className="text-link" onClick={() => onDayIndex(today)}>
          Torna a oggi
        </button>
      ) : null}

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
            size={92}
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
        <span>Ordine libero</span>
      </div>

      <div className="meal-grid">
        {MEALS.map((meal) => {
          const complete = Boolean(checks[meal.id])
          return (
            <article key={meal.id} className={complete ? 'meal is-done' : 'meal'}>
              <button
                type="button"
                className="ring-btn"
                aria-pressed={complete}
                aria-label={complete ? `${meal.label} fatto, annulla` : `Segna ${meal.label} come fatto`}
                onClick={() => toggleMeal(dateKey, meal.id)}
              >
                <DottedRing
                  value={complete ? 1 : 0}
                  size={56}
                  dots={22}
                  color="#CCFF00"
                  track="#2C2C2E"
                  thickness={3}
                  center={complete ? <IconCheck /> : null}
                />
              </button>
              <button type="button" className="meal-open" onClick={() => onMeal(meal.id)}>
                <span className="meal-name">{meal.label}</span>
                <span className="meal-lead">{meals[meal.id]}</span>
              </button>
            </article>
          )
        })}
      </div>

      <section className="card water" aria-label="Acqua">
        <div className="water-line">
          <div>
            <p className={glasses * GLASS_ML >= GOAL_ML ? 'eyebrow is-done' : 'eyebrow'}>
              {glasses * GLASS_ML >= GOAL_ML ? 'Fatto' : 'Acqua'}
            </p>
            <p className="water-value" aria-live="polite">
              {formatLiters(water)}
            </p>
          </div>
          <div className="glasses" role="group" aria-label="Bicchieri da 250 millilitri, un tocco aggiunge fino a quel bicchiere">
          {Array.from({ length: 8 }, (_, index) => {
            const target = index + 1
            const on = index < glasses
            return (
              <button
                key={index}
                type="button"
                className={on ? 'glass is-on' : 'glass'}
                aria-pressed={on}
                aria-label={`${target * GLASS_ML} ml`}
                data-testid={index === 0 ? 'water-glass' : undefined}
                onClick={() => setWater(dateKey, (target === glasses ? target - 1 : target) * GLASS_ML)}
              />
            )
          })}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setWater(dateKey, water - GLASS_ML)}
            disabled={glasses === 0}
            aria-label="Togli 250 ml"
          >
            −
          </button>
        </div>
      </section>

      <div className="pair">
        <button type="button" className="card info-card" onClick={onNotes}>
          <span className="eyebrow">Note</span>
          <strong>Pesa a crudo</strong>
          <span>Olio, spezie, cottura</span>
        </button>
        <button type="button" className="card info-card" onClick={onSwap}>
          <span className="eyebrow">Vincolo</span>
          <strong>Giornata intera</strong>
          <span>I pasti restano nel loro giorno</span>
        </button>
      </div>

      </div>
  )
}
