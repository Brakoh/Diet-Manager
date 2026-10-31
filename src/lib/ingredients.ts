import type { Category } from '../types'
import { labelFor } from './substitutions'

export type DetectedFood = {
  category: Category
  from: string
  to: string
  grams: number
  label: string
}

type Rule = { re: RegExp; category: Category; from: string }

const RULES: Rule[] = [
  { re: /pasta di legumi/i, category: 'legumi', from: 'pasta' },
  { re: /lenticchie secche|legumi secchi/i, category: 'legumi', from: 'secchi' },
  { re: /piselli/i, category: 'legumi', from: 'piselli' },
  { re: /ceci|fagioli|lenticchie/i, category: 'legumi', from: 'cotti' },
  { re: /cous\s?cous/i, category: 'cereali', from: 'couscous' },
  { re: /\bfarro\b/i, category: 'cereali', from: 'farro' },
  { re: /\borzo\b/i, category: 'cereali', from: 'orzo' },
  { re: /\bmiglio\b/i, category: 'cereali', from: 'miglio' },
  { re: /\briso\b/i, category: 'cereali', from: 'riso' },
  { re: /\bpasta\b/i, category: 'cereali', from: 'pasta' },
  { re: /\bpatate\b/i, category: 'cereali', from: 'patate' },
  { re: /\bpane\b|\bpancarr/i, category: 'cereali', from: 'pane' },
  { re: /broccoli/i, category: 'verdure', from: 'broccoli' },
  { re: /zucchine/i, category: 'verdure', from: 'zucchine' },
  { re: /bietol/i, category: 'verdure', from: 'bietole' },
  { re: /spinaci/i, category: 'verdure', from: 'spinaci' },
  { re: /funghi/i, category: 'verdure', from: 'funghi' },
  { re: /carciofi/i, category: 'verdure', from: 'carciofi' },
  { re: /\bzucca\b/i, category: 'verdure', from: 'zucca' },
  { re: /melanzane/i, category: 'verdure', from: 'melanzane' },
  { re: /cicoria/i, category: 'verdure', from: 'cicoria' },
  { re: /scarola/i, category: 'verdure', from: 'scarola' },
  { re: /minestrone/i, category: 'verdure', from: 'minestrone' },
  { re: /pomodor/i, category: 'verdure', from: 'pomodori' },
  { re: /rucola/i, category: 'verdure', from: 'rucola' },
  { re: /\bverdure\b/i, category: 'verdure', from: 'altra' },
]

const SHORT: Record<string, string> = {
  pasta: 'pasta',
  riso: 'riso',
  couscous: 'couscous',
  farro: 'farro',
  orzo: 'orzo',
  miglio: 'miglio',
  pane: 'pane',
  patate: 'patate',
  cotti: 'legumi cotti',
  secchi: 'legumi secchi',
  piselli: 'piselli',
}

export function splitIngredients(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of text) {
    if (char === '(') depth += 1
    if (char === ')') depth = Math.max(0, depth - 1)
    if (char === '+' && depth === 0) {
      if (current.trim()) parts.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function classify(snippet: string): Rule | null {
  let best: Rule | null = null
  let bestIndex = Infinity
  for (const rule of RULES) {
    const match = rule.re.exec(snippet)
    if (match && match.index < bestIndex) {
      best = rule
      bestIndex = match.index
    }
  }
  return best
}

function depthAt(text: string, index: number): number {
  let depth = 0
  for (let i = 0; i < index; i += 1) {
    if (text[i] === '(') depth += 1
    if (text[i] === ')') depth = Math.max(0, depth - 1)
  }
  return depth
}

function defaultTarget(category: Category, from: string): string {
  if (category === 'cereali') {
    if (from === 'pane') return 'pasta'
    if (from === 'patate') return 'pane'
    return 'pane'
  }
  if (category === 'legumi') {
    if (from === 'cotti') return 'secchi'
    if (from === 'piselli') return 'cotti'
    return 'cotti'
  }
  return from === 'broccoli' ? 'zucchine' : 'broccoli'
}

function shortLabel(category: Category, from: string): string {
  if (category === 'legumi' && from === 'pasta') return 'pasta di legumi'
  return SHORT[from] ?? labelFor(category, from).toLowerCase()
}

export function detectFoods(text: string): DetectedFood[] {
  const pattern = /(\d+(?:[.,]\d+)?)\s*g\b/gi
  const matches = [...text.matchAll(pattern)]
  const found: DetectedFood[] = []
  const seen = new Set<string>()

  matches.forEach((match, index) => {
    const grams = Number(match[1].replace(',', '.'))
    if (!Number.isFinite(grams) || grams <= 0) return
    const start = match.index ?? 0
    const end = start + match[0].length
    const depth = depthAt(text, start)
    const nextGram = matches[index + 1]?.index ?? text.length
    let windowEnd = nextGram
    if (depth === 0) {
      const paren = text.indexOf('(', end)
      if (paren !== -1 && paren < windowEnd) windowEnd = paren
    }
    const after = text.slice(end, windowEnd)
    let rule = classify(after)
    if (!rule && depth > 0) {
      const open = text.lastIndexOf('(', start)
      rule = classify(text.slice(Math.max(0, open - 40), open))
    }
    if (!rule && depth === 0) rule = classify(text.slice(Math.max(0, start - 24), start))
    if (!rule) return
    const key = `${rule.category}:${rule.from}:${grams}`
    if (seen.has(key)) return
    seen.add(key)
    found.push({
      category: rule.category,
      from: rule.from,
      to: defaultTarget(rule.category, rule.from),
      grams,
      label: shortLabel(rule.category, rule.from),
    })
  })

  return found
}
