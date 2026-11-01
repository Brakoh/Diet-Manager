import { useMemo, useState } from 'react'
import { DAYS, MEALS, dayById } from '../data/days'
import { GROCERY_CATEGORIES } from '../data/groceryCatalog'
import { todayIndex } from '../lib/dates'
import { buildGrocery, formatPortion, type GroceryAlt, type GroceryItem } from '../lib/grocery'
import { useNow } from '../lib/schedule'
import type { DayId, MealId } from '../types'
import { useDiet } from '../state/store'
import { IconCheck } from './icons'

type DayFilter = 'tutti' | DayId

const DAY_BADGE: Record<DayId, string> = {
  lun: 'LUN',
  mar: 'MAR',
  mer: 'MER',
  gio: 'GIO',
  ven: 'VEN',
  sab: 'SAB',
  dom: 'DOM',
}

function dayBadges(days: DayId[]) {
  if (days.length === DAYS.length) return ['Tutti i giorni']
  return days.map((id) => DAY_BADGE[id])
}

function altLine(alternatives: GroceryAlt[]): string | null {
  if (alternatives.length === 0) return null
  const text = alternatives
    .map((item) => {
      const amount = formatPortion(item.portion)
      return amount ? `${item.label} · ${amount}` : item.label
    })
    .join(' o ')
  return `Alternativa: ${text}`
}

function GroceryRow({
  item,
  bought,
  filter,
  meal,
  onToggle,
}: {
  item: GroceryItem
  bought: boolean
  filter: DayFilter
  meal?: MealId
  onToggle: () => void
}) {
  const slot =
    filter === 'tutti' ? null : meal ? item.byDay[filter]?.meals[meal] : item.byDay[filter]
  const amount = slot ? formatPortion(slot.portion) : null
  const alt =
    filter === 'tutti'
      ? item.alternatives.length
        ? `Alternativa: ${item.alternatives.join(' o ')}`
        : null
      : altLine(slot?.alternatives ?? [])

  return (
    <li className={bought ? 'shop-row is-bought' : 'shop-row'}>
      <button type="button" aria-pressed={bought} onClick={onToggle}>
        <span className="shop-check" aria-hidden="true">
          {bought ? <IconCheck size={14} /> : null}
        </span>
        <span className="shop-copy">
          <span className="shop-line">
            <span className="shop-name">{item.label}</span>
            {amount ? <span className="shop-amount">{amount}</span> : null}
          </span>
          {alt ? <span className="shop-alt">{alt}</span> : null}
          {filter === 'tutti' ? (
            <span className="shop-days">
              {dayBadges(item.days).map((badge) => (
                <span key={badge} className="shop-badge">
                  {badge}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  )
}

function GroceryGroup({
  id,
  title,
  hint,
  items,
  bought,
  filter,
  meal,
  onToggle,
}: {
  id: string
  title: string
  hint?: string
  items: GroceryItem[]
  bought: boolean
  filter: DayFilter
  meal?: MealId
  onToggle: (id: string) => void
}) {
  if (items.length === 0) return null
  return (
    <details className="shop-group" open>
      <summary>
        <span>
          <strong>{title}</strong>
          {hint ? <small>{hint}</small> : null}
        </span>
        <em>{items.length}</em>
      </summary>
      <ul className="shop-list">
        {items.map((item) => (
          <GroceryRow
            key={`${id}-${item.id}`}
            item={item}
            bought={bought}
            filter={filter}
            meal={meal}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </ul>
    </details>
  )
}

export function GroceryList() {
  const { state, toggleGrocery, resetGrocery } = useDiet()
  const now = useNow()
  const today = todayIndex(now)
  const [filter, setFilter] = useState<DayFilter>('tutti')
  const [armReset, setArmReset] = useState(false)
  const plan = state.plan
  const items = useMemo(
    () => (plan ? buildGrocery(plan, state.assignment) : []),
    [plan, state.assignment],
  )
  const boughtIds = state.grocery
  const boughtSet = useMemo(() => new Set(boughtIds), [boughtIds])
  const visible = items.filter((item) => filter === 'tutti' || item.days.includes(filter))
  const bought = boughtIds
    .map((id) => visible.find((item) => item.id === id))
    .filter((item): item is GroceryItem => Boolean(item))
  const open = visible.filter((item) => !boughtSet.has(item.id))
  const remaining = open.length
  const grouped =
    filter === 'tutti'
      ? GROCERY_CATEGORIES.map((category) => ({
          id: category.id,
          title: category.title,
          hint: category.hint,
          meal: undefined as MealId | undefined,
          items: open.filter((item) => item.category === category.id),
        })).filter((category) => category.items.length > 0)
      : MEALS.map((meal) => ({
          id: meal.id,
          title: meal.label,
          hint: undefined as string | undefined,
          meal: meal.id,
          items: open.filter((item) => item.byDay[filter]?.meals[meal.id]),
        })).filter((meal) => meal.items.length > 0)

  function toggle(id: string) {
    setArmReset(false)
    toggleGrocery(id)
  }

  return (
    <div className="view" data-testid="grocery">
      <header className="page-head">
        <p className="eyebrow">Settimana</p>
        <h1>Lista della spesa</h1>
      </header>

      <div className="week shop-week" role="group" aria-label="Filtra per giorno">
        <button
          type="button"
          className={filter === 'tutti' ? 'day is-selected' : 'day'}
          aria-pressed={filter === 'tutti'}
          onClick={() => setFilter('tutti')}
        >
          Tutti
        </button>
        {DAYS.map((item, index) => {
          const moved = state.assignment[item.id] !== item.id
          const selected = filter === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={`day${selected ? ' is-selected' : ''}${index === today ? ' is-today' : ''}${moved ? ' is-swapped' : ''}`}
              aria-pressed={selected}
              aria-label={moved ? `${item.label}, piano di ${dayById(state.assignment[item.id]).label}` : item.label}
              onClick={() => setFilter(item.id)}
            >
              {item.short}
            </button>
          )
        })}
      </div>

      <div className="shop-tools">
        <p>{remaining === 0 ? 'Tutto segnato' : `${remaining} da comprare`}</p>
        {bought.length > 0 ? (
          <button
            type="button"
            className="shop-reset"
            onClick={() => {
              if (!armReset) {
                setArmReset(true)
                return
              }
              resetGrocery()
              setArmReset(false)
            }}
          >
            {armReset ? 'Conferma reset' : 'Reset lista'}
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? <p className="hint">Niente in lista per questo giorno.</p> : null}

      <GroceryGroup id="bought" title="Acquistati" items={bought} bought filter={filter} onToggle={toggle} />

      {grouped.map((category) => (
        <GroceryGroup
          key={category.id}
          id={category.id}
          title={category.title}
          hint={category.hint}
          items={category.items}
          bought={false}
          filter={filter}
          meal={category.meal}
          onToggle={toggle}
        />
      ))}
    </div>
  )
}
