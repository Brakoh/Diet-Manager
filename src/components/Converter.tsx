import { useEffect, useState } from 'react'
import type { Category } from '../types'
import { convert, labelFor, optionsFor, CATEGORY_RULES } from '../lib/substitutions'
import { formatNumber } from '../lib/text'
import type { DetectedFood } from '../lib/ingredients'

export type ConverterSeed = DetectedFood & { id: number; hint: string }

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'cereali', label: 'Cereali' },
  { id: 'verdure', label: 'Verdure' },
  { id: 'legumi', label: 'Legumi' },
]

function parseAmount(value: string): number {
  const amount = Number(value.replace(',', '.'))
  return Number.isFinite(amount) ? amount : Number.NaN
}

export function Converter({ seed }: { seed: ConverterSeed | null }) {
  const [category, setCategory] = useState<Category>('cereali')
  const [from, setFrom] = useState('pane')
  const [to, setTo] = useState('pasta')
  const [grams, setGrams] = useState('50')
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    if (!seed) return
    setCategory(seed.category)
    setFrom(seed.from)
    setTo(seed.to)
    setGrams(String(seed.grams).replace('.', ','))
    setHint(seed.hint)
    document.querySelector('.app')?.scrollTo({ top: 0 })
  }, [seed])

  const options = optionsFor(category)
  const amount = parseAmount(grams)
  const result = Number.isFinite(amount) ? convert(category, from, to, amount) : null
  const rules = CATEGORY_RULES[category]

  function changeCategory(next: Category) {
    const nextOptions = optionsFor(next)
    setCategory(next)
    setFrom(nextOptions[0].id)
    setTo(nextOptions[1]?.id ?? nextOptions[0].id)
    setHint(null)
  }

  function bump(delta: number) {
    const base = Number.isFinite(amount) ? amount : 0
    const next = Math.min(2000, Math.max(0, Math.round((base + delta) * 10) / 10))
    setGrams(Number.isInteger(next) ? String(next) : String(next).replace('.', ','))
  }

  return (
    <div className="view">
      <header className="page-head">
        <p className="eyebrow">Motore</p>
        <h1>Sostituzioni</h1>
      </header>

      <div className="segments" role="group" aria-label="Categoria">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id}
            onClick={() => changeCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {hint ? <p className="hint">Dal pasto: {hint}</p> : null}

      <label className="field">
        <span>Da</span>
        <select value={from} onChange={(event) => setFrom(event.target.value)}>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="stepper">
        <button type="button" onClick={() => bump(-5)} aria-label="Togli 5 grammi">
          −
        </button>
        <label>
          <span className="sr-only">Grammi</span>
          <input
            inputMode="decimal"
            autoComplete="off"
            value={grams}
            onChange={(event) => setGrams(event.target.value.replace(/[^\d.,]/g, ''))}
          />
          <em>g</em>
        </label>
        <button type="button" onClick={() => bump(5)} aria-label="Aggiungi 5 grammi">
          +
        </button>
      </div>

      <label className="field">
        <span>A</span>
        <select value={to} onChange={(event) => setTo(event.target.value)}>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <section
        className={result?.ok ? 'result' : 'result is-idle'}
        aria-live="polite"
        data-testid="convert-result"
      >
        <p className="eyebrow">Equivalenza</p>
        {result?.ok ? (
          <>
            <p className="result-value">
              {formatNumber(result.grams)}
              <small> g</small>
            </p>
            <p className="result-target">di {labelFor(category, to).toLowerCase()}</p>
            <p className="result-formula">{result.formula}</p>
          </>
        ) : (
          <p className="result-reason">{result?.reason ?? 'Inserisci un peso.'}</p>
        )}
      </section>

      <section className="card rule-card">
        <h2>{rules.title}</h2>
        <ul>
          {rules.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
