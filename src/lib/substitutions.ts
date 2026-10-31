import type { Category } from '../types'
import { formatNumber } from './text'

export type ConvertResult =
  | { ok: true; grams: number; formula: string }
  | { ok: false; reason: string }

type CerealId = 'pasta' | 'riso' | 'couscous' | 'farro' | 'orzo' | 'miglio' | 'pane' | 'patate'
type LegumeId = 'cotti' | 'secchi' | 'pasta' | 'piselli'
type VeggieId =
  | 'broccoli'
  | 'zucchine'
  | 'bietole'
  | 'spinaci'
  | 'funghi'
  | 'carciofi'
  | 'zucca'
  | 'melanzane'
  | 'cicoria'
  | 'scarola'
  | 'minestrone'
  | 'pomodori'
  | 'rucola'
  | 'altra'

export const CEREALS: { id: CerealId; label: string }[] = [
  { id: 'pasta', label: 'Pasta' },
  { id: 'riso', label: 'Riso' },
  { id: 'couscous', label: 'Couscous' },
  { id: 'farro', label: 'Farro' },
  { id: 'orzo', label: 'Orzo' },
  { id: 'miglio', label: 'Miglio' },
  { id: 'pane', label: 'Pane' },
  { id: 'patate', label: 'Patate crude' },
]

export const LEGUMES: { id: LegumeId; label: string }[] = [
  { id: 'cotti', label: 'Ceci, fagioli o lenticchie cotti' },
  { id: 'secchi', label: 'Legumi secchi' },
  { id: 'pasta', label: 'Pasta di legumi' },
  { id: 'piselli', label: 'Piselli, barattolo o surgelati' },
]

export const VEGGIES: { id: VeggieId; label: string }[] = [
  { id: 'broccoli', label: 'Broccoli' },
  { id: 'zucchine', label: 'Zucchine' },
  { id: 'bietole', label: 'Bietole' },
  { id: 'spinaci', label: 'Spinaci' },
  { id: 'funghi', label: 'Funghi' },
  { id: 'carciofi', label: 'Carciofi' },
  { id: 'zucca', label: 'Zucca' },
  { id: 'melanzane', label: 'Melanzane' },
  { id: 'cicoria', label: 'Cicoria' },
  { id: 'scarola', label: 'Scarola' },
  { id: 'minestrone', label: 'Minestrone di verdure' },
  { id: 'pomodori', label: 'Pomodori' },
  { id: 'rucola', label: 'Rucola' },
  { id: 'altra', label: 'Altra verdura o ortaggio' },
]

export const CATEGORY_RULES: Record<Category, { title: string; lines: string[] }> = {
  cereali: {
    title: 'Cereali',
    lines: [
      'Pasta, riso, couscous, farro, orzo e miglio si scambiano alla stessa dose.',
      'Dal pane alla pasta togli 10 g. Dalla pasta al pane aggiungi 10 g.',
      'Dal pane alle patate crude moltiplica per 4. Dalle patate al pane dividi per 4.',
    ],
  },
  verdure: {
    title: 'Verdure e ortaggi',
    lines: ['Tutte le verdure e gli ortaggi si scambiano alla stessa dose, pesate crude.'],
  },
  legumi: {
    title: 'Legumi',
    lines: [
      'Ceci, fagioli e lenticchie si scambiano alla stessa dose.',
      'Legumi cotti = legumi secchi × 3. Legumi secchi = legumi cotti ÷ 3.',
      'La pasta di legumi pesa come i legumi secchi.',
      'I piselli (barattolo o surgelati) pesano 50 g in più degli altri legumi cotti.',
    ],
  },
}

const CEREAL_IDS = new Set(CEREALS.map((item) => item.id))
const LEGUME_IDS = new Set(LEGUMES.map((item) => item.id))
const VEGGIE_IDS = new Set(VEGGIES.map((item) => item.id))

function kind(id: string): 'dry' | 'bread' | 'potato' {
  if (id === 'pane') return 'bread'
  if (id === 'patate') return 'potato'
  return 'dry'
}

function fail(reason: string): ConvertResult {
  return { ok: false, reason }
}

function ok(grams: number, formula: string): ConvertResult {
  return { ok: true, grams, formula }
}

function convertCereal(from: string, to: string, grams: number): ConvertResult {
  if (!CEREAL_IDS.has(from as CerealId) || !CEREAL_IDS.has(to as CerealId)) {
    return fail('Scegli due cereali della lista.')
  }
  if (grams <= 0) return fail('Inserisci un peso maggiore di zero.')
  if (from === to) return ok(grams, 'Stessa dose, 1:1.')

  const fromKind = kind(from)
  const toKind = kind(to)
  const amount = formatNumber(grams)

  if (fromKind === 'dry' && toKind === 'dry') return ok(grams, 'Stessa dose, 1:1.')

  if (fromKind === 'bread' && toKind === 'dry') {
    const result = grams - 10
    if (result <= 0) return fail('Con meno di 10 g di pane non resta un equivalente.')
    return ok(result, `${amount} − 10 = ${formatNumber(result)} g`)
  }

  if (fromKind === 'dry' && toKind === 'bread') {
    const result = grams + 10
    return ok(result, `${amount} + 10 = ${formatNumber(result)} g`)
  }

  if (fromKind === 'bread' && toKind === 'potato') {
    const result = grams * 4
    return ok(result, `${amount} × 4 = ${formatNumber(result)} g`)
  }

  if (fromKind === 'potato' && toKind === 'bread') {
    const result = grams / 4
    return ok(result, `${amount} ÷ 4 = ${formatNumber(result)} g`)
  }

  if (fromKind === 'dry' && toKind === 'potato') {
    const bread = grams + 10
    const result = bread * 4
    return ok(result, `${amount} + 10 = ${formatNumber(bread)} g di pane, poi × 4 = ${formatNumber(result)} g`)
  }

  const bread = grams / 4
  const result = bread - 10
  if (result <= 0) return fail('Le patate sono troppo poche per ottenere il cereale.')
  return ok(result, `${amount} ÷ 4 = ${formatNumber(bread)} g di pane, poi − 10 = ${formatNumber(result)} g`)
}

function convertLegume(from: string, to: string, grams: number): ConvertResult {
  if (!LEGUME_IDS.has(from as LegumeId) || !LEGUME_IDS.has(to as LegumeId)) {
    return fail('Scegli due legumi della lista.')
  }
  if (grams <= 0) return fail('Inserisci un peso maggiore di zero.')
  if (from === to) return ok(grams, 'Stessa dose, 1:1.')

  const dry = (id: string) => id === 'secchi' || id === 'pasta'
  const amount = formatNumber(grams)

  if (dry(from) && dry(to)) return ok(grams, 'Stessa dose: la pasta di legumi pesa come i legumi secchi.')

  if (from === 'cotti' && dry(to)) {
    const result = grams / 3
    return ok(result, `${amount} ÷ 3 = ${formatNumber(result)} g`)
  }

  if (dry(from) && to === 'cotti') {
    const result = grams * 3
    return ok(result, `${amount} × 3 = ${formatNumber(result)} g`)
  }

  if (from === 'cotti' && to === 'piselli') {
    const result = grams + 50
    return ok(result, `${amount} + 50 = ${formatNumber(result)} g`)
  }

  if (from === 'piselli' && to === 'cotti') {
    const result = grams - 50
    if (result <= 0) return fail('Servono più di 50 g di piselli.')
    return ok(result, `${amount} − 50 = ${formatNumber(result)} g`)
  }

  if (dry(from) && to === 'piselli') {
    const cooked = grams * 3
    const result = cooked + 50
    return ok(result, `${amount} × 3 = ${formatNumber(cooked)} g cotti, poi + 50 = ${formatNumber(result)} g`)
  }

  const cooked = grams - 50
  if (cooked <= 0) return fail('Servono più di 50 g di piselli.')
  const result = cooked / 3
  return ok(result, `${amount} − 50 = ${formatNumber(cooked)} g cotti, poi ÷ 3 = ${formatNumber(result)} g`)
}

function convertVeggie(from: string, to: string, grams: number): ConvertResult {
  if (!VEGGIE_IDS.has(from as VeggieId) || !VEGGIE_IDS.has(to as VeggieId)) {
    return fail('Scegli due verdure della lista.')
  }
  if (grams <= 0) return fail('Inserisci un peso maggiore di zero.')
  return ok(grams, 'Stessa dose, a crudo.')
}

export function convert(category: Category, from: string, to: string, grams: number): ConvertResult {
  if (category === 'cereali') return convertCereal(from, to, grams)
  if (category === 'legumi') return convertLegume(from, to, grams)
  return convertVeggie(from, to, grams)
}

export function optionsFor(category: Category) {
  if (category === 'cereali') return CEREALS
  if (category === 'legumi') return LEGUMES
  return VEGGIES
}

export function labelFor(category: Category, id: string): string {
  return optionsFor(category).find((item) => item.id === id)?.label ?? id
}
