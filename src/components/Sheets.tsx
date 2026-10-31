import { useEffect, useState, type ReactNode } from 'react'
import { DAYS, dayById, MEALS } from '../data/days'
import { PLAN_RULES } from '../data/rules'
import { dateForDayIndex, isoDate } from '../lib/dates'
import { detectFoods, splitIngredients, type DetectedFood } from '../lib/ingredients'
import { formatNumber } from '../lib/text'
import type { DayId, MealId } from '../types'
import { useDiet } from '../state/store'

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-top">
          <div className="handle" />
          <div className="sheet-head">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Chiudi">
              ×
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function MealSheet({
  dayIndex,
  mealId,
  onClose,
  onConvert,
}: {
  dayIndex: number
  mealId: MealId
  onClose: () => void
  onConvert: (food: DetectedFood, hint: string) => void
}) {
  const { state, toggleMeal } = useDiet()
  const day = DAYS[dayIndex]
  const source = dayById(state.assignment[day.id])
  const dateKey = isoDate(dateForDayIndex(dayIndex))
  const meal = MEALS.find((item) => item.id === mealId) ?? MEALS[0]
  const text = state.plan[source.id][meal.id]
  const done = Boolean(state.checks[dateKey]?.[meal.id])
  const parts = splitIngredients(text)

  return (
    <Sheet title={meal.label} onClose={onClose}>
      <p className="sheet-kicker">
        {day.label}
        {source.id !== day.id ? ` · piano di ${source.label}` : ''}
      </p>
      <ul className="ingredients">
        {parts.map((part) => {
          const foods = detectFoods(part)
          return (
            <li key={part}>
              <p>{part}</p>
              {foods.length > 0 ? (
                <div className="chips">
                  {foods.map((food) => (
                    <button
                      key={`${food.category}-${food.from}-${food.grams}`}
                      type="button"
                      className="chip"
                      onClick={() => onConvert(food, part)}
                    >
                      Converti {formatNumber(food.grams)} g {food.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
      <p className="fine">Questo pasto resta in questa giornata. Puoi mangiarlo quando vuoi.</p>
      <button type="button" className={done ? 'ghost solid' : 'primary'} onClick={() => toggleMeal(dateKey, meal.id)}>
        {done ? 'Annulla spunta' : 'Segna come fatto'}
      </button>
    </Sheet>
  )
}

export function SwapSheet({
  dayIndex,
  onClose,
  onDone,
}: {
  dayIndex: number
  onClose: () => void
  onDone: (message: string) => void
}) {
  const { state, swapDays, resetAssignment } = useDiet()
  const current = DAYS[dayIndex]
  const [pick, setPick] = useState<DayId | null>(null)
  const [armReset, setArmReset] = useState(false)
  const moved = DAYS.some((day) => state.assignment[day.id] !== day.id)
  const picked = pick ? dayById(pick) : null
  const currentSource = dayById(state.assignment[current.id])
  const pickedSource = pick ? dayById(state.assignment[pick]) : null

  return (
    <Sheet title={`Scambia ${current.label}`} onClose={onClose}>
      <p className="sheet-lead">
        Si invertono due giornate intere. Nessun alimento viene spostato da solo.
      </p>
      <div className="choices">
        {DAYS.filter((day) => day.id !== current.id).map((day) => {
          const source = dayById(state.assignment[day.id])
          const selected = pick === day.id
          return (
            <button
              key={day.id}
              type="button"
              className={selected ? 'choice is-picked' : 'choice'}
              aria-pressed={selected}
              onClick={() => setPick(day.id)}
            >
              <span className="choice-title">{day.label}</span>
              <span className="choice-plan">
                {source.id === day.id ? 'Piano originale' : `Ha il piano di ${source.label}`}
              </span>
              <span className="choice-food">{state.plan[source.id].colazione}</span>
            </button>
          )
        })}
      </div>
      {picked && pickedSource ? (
        <p className="swap-result">
          {`${current.label} mostrerà il piano di ${pickedSource.label}. ${picked.label} mostrerà il piano di ${currentSource.label}.`}
        </p>
      ) : null}
      <button
        type="button"
        className="primary"
        disabled={!pick}
        onClick={() => {
          if (!pick || !picked) return
          swapDays(current.id, pick)
          onDone(`Scambio fatto: ${current.label} ↔ ${picked.label}`)
        }}
      >
        {picked ? `Inverti con ${picked.label}` : 'Scegli un giorno'}
      </button>
      {moved ? (
        <button
          type="button"
          className="ghost"
          onClick={() => {
            if (!armReset) {
              setArmReset(true)
              return
            }
            resetAssignment()
            onDone('Settimana riallineata al piano originale.')
          }}
        >
          {armReset ? 'Conferma ripristino' : 'Ripristina l’ordine originale'}
        </button>
      ) : null}
    </Sheet>
  )
}

export function NotesSheet({ onClose }: { onClose: () => void }) {
  const { state } = useDiet()
  const sentences = state.meta.notes
    .split(';')
    .map((sentence) => sentence.replace(/^[\s.]+/, '').trim())
    .filter(Boolean)

  return (
    <Sheet title="Note del piano" onClose={onClose}>
      <ol className="rules">
        {PLAN_RULES.map((rule, index) => (
          <li key={rule.title}>
            <span>{index + 1}</span>
            <div>
              <strong>{rule.title}</strong>
              <p>{rule.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <h3 className="sheet-subtitle">Testo del nutrizionista</h3>
      <div className="note-body">
        {sentences.map((sentence) => (
          <p key={sentence}>{sentence.endsWith('.') ? sentence : `${sentence}.`}</p>
        ))}
      </div>
      <p className="fine">
        {state.meta.nutritionist} · Piano del {state.meta.planDate}
      </p>
    </Sheet>
  )
}
