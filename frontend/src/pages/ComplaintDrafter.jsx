import { useEffect, useMemo, useState } from 'react'
import { useAutoResize } from '../hooks/useAutoResize.js'
import { loadItems } from '../lib/evidenceStore.js'
import { downloadBlob } from '../lib/evidence.js'
import { buildLetter, COMMON_FIELDS, missingRequired, SCENARIOS } from '../lib/letterTemplates.js'
import { loadDraft, saveDraft } from '../lib/profileStore.js'

const today = () =>
  new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export default function ComplaintDrafter() {
  const [scenarioId, setScenarioId] = useState('consumer')
  const [data, setData] = useState({})
  const [extraAnnexures, setExtraAnnexures] = useState('')
  const [picked, setPicked] = useState([]) // timeline item ids ticked as enclosures
  const [timeline, setTimeline] = useState([])
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const factsRef = useAutoResize()
  const annexRef = useAutoResize()

  // Load the user's evidence list (titles only) for the enclosure picker.
  useEffect(() => {
    loadItems()
      .then((items) => setTimeline(items))
      .catch(() => {})
  }, [])

  // Restore the draft whenever the scenario changes.
  useEffect(() => {
    let active = true
    loadDraft(scenarioId)
      .then((draft) => {
        if (!active) return
        setData(draft?.data ?? {})
        setExtraAnnexures(draft?.extraAnnexures ?? '')
        setPicked(draft?.picked ?? [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [scenarioId])

  // Persist the draft on every change (small object — cheap in IndexedDB).
  useEffect(() => {
    saveDraft(scenarioId, { data, extraAnnexures, picked }).catch(() => {})
  }, [scenarioId, data, extraAnnexures, picked])

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]

  const setField = (id) => (e) => {
    const { value } = e.target
    setData((prev) => ({ ...prev, [id]: value }))
    setMessage('')
  }

  const togglePicked = (id) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const evidenceTitles = useMemo(
    () =>
      timeline
        .filter((item) => picked.includes(item.id))
        .map((item) => item.title || item.name),
    [timeline, picked],
  )

  const letter = useMemo(
    () => buildLetter(scenarioId, data, evidenceTitles, extraAnnexures),
    [scenarioId, data, evidenceTitles, extraAnnexures],
  )

  const missing = missingRequired(scenario, data)

  const guard = () => {
    if (missing.length) {
      setMessage(`Please fill: ${missing.join(', ')}`)
      return false
    }
    return true
  }

  const handleCopy = async () => {
    if (!guard()) return
    try {
      await navigator.clipboard.writeText(letter)
      setCopied(true)
      setMessage('')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setMessage('Copy failed — select the text in the letter and copy manually.')
    }
  }

  const handleDownload = () => {
    if (!guard()) return
    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, `${scenarioId}-letter-${today().replaceAll(' ', '-')}.txt`)
  }

  return (
    <div className="page-narrow">
      <h2 id="fir_title">Draft a Letter</h2>
      <p id="fir-subtext">
        Turn your situation into a formal complaint or application — consumer commission,
        police, RTI, university or a landlord. Fill a few fields, pull evidence titles from
        your timeline, and get a properly formatted letter you can print, copy or download.
        It is generated on your device; nothing is uploaded.
      </p>

      <div className="drafter-scenarios" role="group" aria-label="Choose letter type">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`filter-chip${scenarioId === s.id ? ' active' : ''}`}
            onClick={() => {
              setScenarioId(s.id)
              setMessage('')
            }}
            title={s.blurb}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="drafter-blurb">{scenario.blurb}</p>

      <div className="drafter-form">
        {COMMON_FIELDS.map((field) => (
          <div className="drafter-field" key={field.id}>
            <label className="editor-label" htmlFor={`f-${field.id}`}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            <input
              id={`f-${field.id}`}
              className="editor-input"
              type="text"
              placeholder={field.placeholder}
              value={data[field.id] ?? ''}
              onChange={setField(field.id)}
            />
          </div>
        ))}

        {scenario.fields.map((field) => (
          <div className="drafter-field" key={field.id}>
            <label className="editor-label" htmlFor={`f-${field.id}`}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={`f-${field.id}`}
                className="editor-textarea"
                rows={3}
                placeholder={field.placeholder}
                value={data[field.id] ?? ''}
                onChange={setField(field.id)}
                ref={field.id === 'facts' || field.id === 'details' || field.id === 'questions' ? factsRef : undefined}
              />
            ) : field.type === 'select' ? (
              <select
                id={`f-${field.id}`}
                className="editor-input"
                value={data[field.id] ?? ''}
                onChange={setField(field.id)}
              >
                <option value="">— choose —</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`f-${field.id}`}
                className="editor-input"
                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                placeholder={field.placeholder}
                value={data[field.id] ?? ''}
                onChange={setField(field.id)}
              />
            )}
          </div>
        ))}
      </div>

      {timeline.length > 0 && (
        <section className="drafter-evidence">
          <h3>Enclosures from your timeline</h3>
          <p className="drafter-evidence-sub">
            Tick the evidence you want listed in the letter — titles come straight from your
            Timeline Generator (they never leave your device).
          </p>
          <ul className="drafter-evidence-list">
            {timeline.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={picked.includes(item.id)}
                    onChange={() => togglePicked(item.id)}
                  />
                  <span>{item.title || item.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="drafter-field">
        <label className="editor-label" htmlFor="f-extra-annexures">
          Any other enclosures (one per line)
        </label>
        <textarea
          id="f-extra-annexures"
          className="editor-textarea"
          rows={2}
          placeholder="e.g. Aadhaar card copy&#10;Bank statement for March"
          value={extraAnnexures}
          onChange={(e) => setExtraAnnexures(e.target.value)}
          ref={annexRef}
        />
      </div>

      {message && <p className="outputs error timeline-message">{message}</p>}

      <section id="print-target">
        <h3 className="drafter-preview-title">Your letter</h3>
        <div className="letter-preview">
          <pre>{letter}</pre>
        </div>
      </section>

      <div className="drafter-actions">
        <button type="button" className="upload-label" onClick={handleCopy}>
          {copied ? 'copied!' : 'copy letter'}
        </button>
        <button type="button" className="btn-outline" onClick={handleDownload}>
          download .txt
        </button>
        <button type="button" className="btn-outline" onClick={() => window.print()}>
          print
        </button>
      </div>
      <p className="drafter-note">
        Print it, sign it, and post it or hand it in — always keep a photocopy or photo of
        what you sent, and send it by registered post or get a receiving stamp. Everything
        is drafted on your device.
      </p>
    </div>
  )
}
