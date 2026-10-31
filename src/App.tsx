import { useEffect, useState } from 'react'
import { Converter, type ConverterSeed } from './components/Converter'
import { Dashboard } from './components/Dashboard'
import { MealSheet, NotesSheet, SwapSheet } from './components/Sheets'
import { TabBar, type TabId } from './components/TabBar'
import { Upload } from './components/Upload'
import type { DetectedFood } from './lib/ingredients'
import { todayIndex } from './lib/dates'
import type { MealId } from './types'
import { DietProvider, useDiet } from './state/store'

type SheetState = null | { type: 'swap' } | { type: 'notes' } | { type: 'meal'; meal: MealId }

function Shell() {
  const { state, persistWarning } = useDiet()
  const hasPlan = state.plan !== null
  const [tab, setTab] = useState<TabId>('oggi')
  const [dayIndex, setDayIndex] = useState(() => todayIndex())
  const [sheet, setSheet] = useState<SheetState>(null)
  const [seed, setSeed] = useState<ConverterSeed | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    document.querySelector('.app')?.scrollTo({ top: 0 })
  }, [tab])

  function openConvert(food: DetectedFood, hint: string) {
    setSeed({ ...food, id: Date.now(), hint })
    setSheet(null)
    setTab('sostituzioni')
  }

  if (!hasPlan) {
    return (
      <div className="app">
        {persistWarning ? (
          <p className="persist-warning">Non riesco a salvare sul telefono. Lo spazio potrebbe essere pieno.</p>
        ) : null}
        <Upload onApplied={setToast} />
        {toast ? (
          <p className="toast" role="status">
            {toast}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={sheet ? 'app is-locked' : 'app'}>
      {persistWarning ? (
        <p className="persist-warning">Non riesco a salvare sul telefono. Lo spazio potrebbe essere pieno.</p>
      ) : null}
      <div hidden={tab !== 'oggi'}>
        <Dashboard
          dayIndex={dayIndex}
          onDayIndex={setDayIndex}
          onSwap={() => setSheet({ type: 'swap' })}
          onNotes={() => setSheet({ type: 'notes' })}
          onMeal={(meal) => setSheet({ type: 'meal', meal })}
        />
      </div>
      <div hidden={tab !== 'sostituzioni'}>
        <Converter seed={seed} />
      </div>
      <div hidden={tab !== 'file'}>
        <Upload onApplied={setToast} />
      </div>
      <TabBar
        tab={tab}
        onTab={(next) => {
          setSheet(null)
          setTab(next)
        }}
      />
      {toast ? (
        <p className="toast" role="status">
          {toast}
        </p>
      ) : null}
      {sheet?.type === 'meal' ? (
        <MealSheet
          dayIndex={dayIndex}
          mealId={sheet.meal}
          onClose={() => setSheet(null)}
          onConvert={openConvert}
        />
      ) : null}
      {sheet?.type === 'swap' ? (
        <SwapSheet
          dayIndex={dayIndex}
          onClose={() => setSheet(null)}
          onDone={(message) => {
            setToast(message)
            setSheet(null)
          }}
        />
      ) : null}
      {sheet?.type === 'notes' ? <NotesSheet onClose={() => setSheet(null)} /> : null}
    </div>
  )
}

export default function App() {
  return (
    <DietProvider>
      <Shell />
    </DietProvider>
  )
}
