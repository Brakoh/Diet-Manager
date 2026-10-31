import assert from 'node:assert/strict'
import fs from 'node:fs'
import mammoth from 'mammoth'
import { DAY_IDS, identityAssignment, isValidAssignment, MEAL_IDS } from '../data/days'
import { defaultPlan } from '../data/defaultPlan'
import { detectFoods, splitIngredients } from './ingredients'
import { parsePlanText } from './parseDocx'
import { convert } from './substitutions'
import { normalizeText } from './text'
import type { Assignment, DayId } from '../types'

function near(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} !== ${expected}`)
}

near(okGrams('cereali', 'pane', 'pasta', 50), 40)
near(okGrams('cereali', 'pasta', 'pane', 40), 50)
near(okGrams('cereali', 'pane', 'patate', 50), 200)
near(okGrams('cereali', 'patate', 'pane', 200), 50)
near(okGrams('cereali', 'pasta', 'riso', 70), 70)
near(okGrams('cereali', 'riso', 'pane', 70), 80)
near(okGrams('cereali', 'patate', 'pasta', 200), 40)
near(okGrams('cereali', 'pasta', 'patate', 40), 200)
near(okGrams('cereali', 'farro', 'miglio', 70), 70)
near(okGrams('cereali', 'couscous', 'orzo', 80), 80)
near(okGrams('legumi', 'cotti', 'secchi', 200), 200 / 3)
near(okGrams('legumi', 'secchi', 'cotti', 65), 195)
near(okGrams('legumi', 'cotti', 'pasta', 200), 200 / 3)
near(okGrams('legumi', 'secchi', 'pasta', 65), 65)
near(okGrams('legumi', 'cotti', 'piselli', 200), 250)
near(okGrams('legumi', 'piselli', 'cotti', 250), 200)
near(okGrams('legumi', 'piselli', 'secchi', 250), 200 / 3)
near(okGrams('legumi', 'pasta', 'piselli', 65), 65 * 3 + 50)
near(okGrams('verdure', 'broccoli', 'zucchine', 200), 200)
assert.equal(convert('cereali', 'pane', 'pasta', 5).ok, false)
assert.equal(convert('legumi', 'piselli', 'cotti', 50).ok, false)
assert.equal(convert('legumi', 'piselli', 'secchi', 40).ok, false)

function okGrams(category: 'cereali' | 'verdure' | 'legumi', from: string, to: string, amount: number) {
  const result = convert(category, from, to, amount)
  assert.equal(result.ok, true, result.ok ? '' : result.reason)
  return result.ok ? result.grams : Number.NaN
}

const rice = detectFoods('70g riso o pasta con 150g ceci o lenticchie o fagioli cotti')
assert.deepEqual(
  rice.map((food) => [food.from, food.grams, food.category]),
  [
    ['riso', 70, 'cereali'],
    ['cotti', 150, 'legumi'],
  ],
)

const potatoes = detectFoods('200g patate (o 50g pane)')
assert.deepEqual(
  potatoes.map((food) => [food.from, food.grams]),
  [
    ['patate', 200],
    ['pane', 50],
  ],
)

assert.deepEqual(
  detectFoods('50g frisella integrale (o 60g pane integrale)').map((food) => [food.from, food.grams]),
  [['pane', 60]],
)
assert.deepEqual(detectFoods('40g cornflakes (o fiocchi di farro o di riso e frumento)'), [])
assert.deepEqual(detectFoods('1 banana (150g)'), [])
assert.deepEqual(detectFoods('1 cucchiaio di olio (10ml)'), [])
assert.equal(
  detectFoods('200g ceci o lenticchie o fagioli cotti (o 65g pasta di legumi o lenticchie secche)')[0]?.from,
  'cotti',
)
assert.equal(
  detectFoods('65g pasta di legumi o lenticchie secche')[0]?.from,
  'pasta',
)
assert.equal(detectFoods('65g pasta di legumi o lenticchie secche')[0]?.category, 'legumi')

const parts = splitIngredients(
  '200g ceci o lenticchie o fagioli cotti (o 65g pasta di legumi o lenticchie secche) + 50g pane tostato + 200g minestrone solo verdure + 1 cucchiaio di olio (10ml)',
)
assert.equal(parts.length, 4)
assert.deepEqual(splitIngredients('a (b + c) + d'), ['a (b + c)', 'd'])

function swap(assignment: Assignment, a: DayId, b: DayId): Assignment {
  const next = { ...assignment }
  const sourceA = next[a]
  const sourceB = next[b]
  next[a] = sourceB
  next[b] = sourceA
  return next
}

let assignment = identityAssignment()
assignment = swap(assignment, 'sab', 'gio')
assert.equal(assignment.sab, 'gio')
assert.equal(assignment.gio, 'sab')
assert.equal(assignment.lun, 'lun')
assert.equal(isValidAssignment(assignment), true)
assignment = swap(assignment, 'sab', 'ven')
assert.equal(assignment.sab, 'ven')
assert.equal(assignment.ven, 'gio')
assert.equal(assignment.gio, 'sab')
assert.equal(new Set(Object.values(assignment)).size, 7)

const buffer = fs.readFileSync('BORRELLO VITTORIO 13-10-2026.docx')
const extracted = await mammoth.extractRawText({ buffer })
const parsed = parsePlanText(extracted.value)
assert.equal(parsed.complete, true, parsed.warnings.join('\n'))
assert.ok(parsed.plan)
assert.match(parsed.notes, /2 litri/)
assert.match(parsed.notes, /piastra/)

for (const dayId of DAY_IDS) {
  for (const mealId of MEAL_IDS) {
    assert.equal(
      normalizeText(parsed.plan?.[dayId][mealId] ?? ''),
      normalizeText(defaultPlan[dayId][mealId]),
      `${dayId} ${mealId}`,
    )
  }
}

assert.equal(parsed.planDate, '13/10/2026')
console.log('ok')
