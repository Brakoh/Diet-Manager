import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { DAYS, dayById, MEALS } from '../data/days'
import { PLAN_RULES } from '../data/rules'
import { dateForDayIndex, isoDate } from '../lib/dates'
import { MEAL_CUTOFF_HOUR, isMealDue, useNow } from '../lib/schedule'
import { detectFoods, splitIngredients, type DetectedFood } from '../lib/ingredients'
import { formatNumber } from '../lib/text'
import type { DayId, MealId } from '../types'
import { useDiet } from '../state/store'

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startY: 0 })
  const closed = useRef(false)
  const [shown, setShown] = useState(false)
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  function dismiss() {
    if (closed.current) return
    const height = sheetRef.current?.offsetHeight ?? 480
    setDragging(false)
    setOffset(height + 48)
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShown(true))
    })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    drag.current = { active: true, startY: event.clientY }
    setDragging(true)
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* pointer capture is unavailable for untrusted events */
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!drag.current.active) return
    setOffset(Math.max(0, event.clientY - drag.current.startY))
  }

  function onPointerUp() {
    if (!drag.current.active) return
    drag.current.active = false
    setDragging(false)
    setOffset((current) => (current > 72 ? (sheetRef.current?.offsetHeight ?? 480) + 48 : 0))
  }

  return (
    <div className="backdrop" onClick={dismiss} role="presentation">
      <div
        ref={sheetRef}
        className={dragging ? 'sheet is-dragging' : 'sheet'}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{
          transform: shown ? `translateY(${offset}px)` : 'translateY(100%)',
          transition: dragging ? 'none' : undefined,
        }}
        onClick={(event) => event.stopPropagation()}
        onTransitionEnd={(event) => {
          if (event.propertyName !== 'transform' || event.target !== sheetRef.current) return
          if (offset > 72 && !closed.current) {
            closed.current = true
            onClose()
          }
        }}
      >
        <div className="sheet-top">
          <button
            type="button"
            className="handle-hit"
            aria-label="Trascina in basso per chiudere"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={(event) => event.stopPropagation()}
          >
            <span className="handle" />
          </button>
          <div className="sheet-head">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" onClick={dismiss} aria-label="Chiudi">
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
  const now = useNow()
  const day = DAYS[dayIndex]
  const source = dayById(state.assignment[day.id])
  const date = dateForDayIndex(dayIndex, now)
  const dateKey = isoDate(date)
  const meal = MEALS.find((item) => item.id === mealId) ?? MEALS[0]
  const plan = state.plan
  if (!plan) return null
  const text = plan[source.id][meal.id]
  const manual = Boolean(state.checks[dateKey]?.[meal.id])
  const scheduled = isMealDue(date, meal.id, now)
  const done = scheduled || manual
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
      <p className="fine">Si spunta da solo dopo le {MEAL_CUTOFF_HOUR[meal.id]}.</p>
      <button
        type="button"
        className={done ? 'ghost solid' : 'primary'}
        disabled={scheduled}
        onClick={() => toggleMeal(dateKey, meal.id)}
      >
        {scheduled ? 'Segnato in automatico' : manual ? 'Annulla spunta' : 'Segna come fatto'}
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
  const plan = state.plan
  if (!plan) return null

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
              <span className="choice-food">{plan[source.id].colazione}</span>
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
      {sentences.length > 0 ? (
        <>
          <h3 className="sheet-subtitle">Testo del nutrizionista</h3>
          <div className="note-body">
            {sentences.map((sentence) => (
              <p key={sentence}>{sentence.endsWith('.') ? sentence : `${sentence}.`}</p>
            ))}
          </div>
        </>
      ) : null}
      {state.meta.nutritionist || state.meta.planDate ? (
        <p className="fine">
          {[state.meta.nutritionist, state.meta.planDate ? `Piano del ${state.meta.planDate}` : '']
            .filter(Boolean)
            .join(' · ')}
        </p>
      ) : null}
    </Sheet>
  )
}
