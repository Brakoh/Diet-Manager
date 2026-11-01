import { useState } from 'react'
import { DAYS, MEALS } from '../data/days'
import { parsePlanText, type ParsedPlan } from '../lib/parseDocx'
import type { Meta } from '../types'
import { useDiet } from '../state/store'
import { IconFile } from './icons'

async function readDocx(file: File): Promise<string> {
  const mod = await import('mammoth')
  const mammoth = mod.default ?? mod
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

function patientName(value: string | null, fallback: string): string {
  if (!value) return fallback
  if (value.toUpperCase() === 'BORRELLO VITTORIO') return 'Vittorio Borrello'
  return value
}

export function Upload({ onApplied }: { onApplied?: (message: string) => void }) {
  const { state, applyPlan } = useDiet()
  const [parsed, setParsed] = useState<ParsedPlan | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [inputKey, setInputKey] = useState(0)

  async function onFile(file: File | undefined) {
    setInputKey((key) => key + 1)
    setError(null)
    setParsed(null)
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setError('Serve un file .docx.')
      return
    }
    if (file.size === 0) {
      setError('Il file è vuoto.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Il file supera i 5 MB.')
      return
    }
    setBusy(true)
    setFileName(file.name)
    try {
      const text = await readDocx(file)
      setParsed(parsePlanText(text))
    } catch {
      setError('Non riesco a leggere questo .docx.')
    } finally {
      setBusy(false)
    }
  }

  function apply() {
    if (!parsed?.plan) return
    const first = state.plan === null
    const meta: Meta = {
      patient: patientName(parsed.patient, state.meta.patient),
      nutritionist: parsed.nutritionist ?? state.meta.nutritionist,
      planDate: parsed.planDate ?? state.meta.planDate,
      notes: parsed.notes || state.meta.notes,
      sourceName: fileName ?? 'piano.docx',
      importedAt: new Date().toISOString(),
    }
    applyPlan(parsed.plan, meta)
    setParsed(null)
    onApplied?.(first ? 'Piano caricato.' : 'Piano aggiornato dal file.')
  }

  const imported = state.meta.importedAt
    ? new Intl.DateTimeFormat('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(state.meta.importedAt))
    : null

  const hasPlan = state.plan !== null

  return (
    <div className={hasPlan ? 'view' : 'view is-gate'}>
      <header className="page-head">
        {hasPlan ? null : <span className="logo gate-logo" aria-hidden="true" />}
        <p className="eyebrow">{hasPlan ? 'Documento' : 'Diet Manager'}</p>
        <h1>{hasPlan ? 'Aggiorna il piano' : 'Carica il tuo piano'}</h1>
      </header>
      <p className="lead">
        {hasPlan
          ? 'Carica un nuovo file .docx del nutrizionista per aggiornare il tuo piano alimentare.'
          : 'Per iniziare scegli il file .docx del nutrizionista. L’app legge i giorni, i quattro pasti e le note sul telefono. Niente viene inviato a un server.'}
      </p>

      <label className="drop">
        <input
          key={inputKey}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
        <IconFile size={28} />
        <strong>{busy ? 'Lettura del file…' : 'Scegli il file .docx'}</strong>
        <span>dal telefono, da iCloud o da Drive</span>
      </label>

      {hasPlan ? (
        <p className="fine">
          Piano attuale: {state.meta.sourceName}
          {imported ? ` · aggiornato ${imported}` : state.meta.planDate ? ` · ${state.meta.planDate}` : ''}
        </p>
      ) : null}

      {error ? <p className="warn">{error}</p> : null}

      {parsed ? (
        <section className="card preview">
          {parsed.warnings.length > 0 ? (
            <ul className="warn-list">
              {parsed.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : (
            <p className="preview-ok">7 giorni, 4 pasti ciascuno.</p>
          )}
          {parsed.plan
            ? DAYS.map((day) => (
                <details key={day.id}>
                  <summary>{day.label}</summary>
                  {MEALS.map((meal) => (
                    <p key={meal.id}>
                      <b>{meal.label}.</b> {parsed.plan?.[day.id][meal.id]}
                    </p>
                  ))}
                </details>
              ))
            : null}
          <button type="button" className="primary" disabled={!parsed.complete} onClick={apply}>
            Usa questo piano
          </button>
          <p className="fine">
            {hasPlan
              ? 'Sostituisce i pasti sul telefono e azzera le spunte. L’acqua resta.'
              : 'I pasti restano solo su questo telefono.'}
          </p>
        </section>
      ) : null}
    </div>
  )
}
