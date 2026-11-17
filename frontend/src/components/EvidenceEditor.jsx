import { useEffect, useRef, useState } from 'react'
import { useAutoResize } from '../hooks/useAutoResize.js'
import { useObjectUrl } from '../hooks/useObjectUrl.js'
import { TYPES, formatDate } from '../lib/evidence.js'

function Preview({ item }) {
  const url = useObjectUrl(item.typeId === 'image' || item.typeId === 'video' ? item.blob : null)

  if (!url) return null
  if (item.typeId === 'image') {
    return <img className="editor-preview" src={url} alt={item.title || item.name} />
  }
  return <video className="editor-preview" src={url} controls preload="metadata" />
}

function AudioPreview({ item }) {
  const url = useObjectUrl(item.typeId === 'audio' ? item.blob : null)

  if (!url) return null
  return <audio className="editor-audio" src={url} controls preload="metadata" />
}

/** How long the exit transition runs (must match the CSS). */
const CLOSE_MS = 240

export default function EvidenceEditor({ item, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState({
    date: item.date || '',
    title: item.title || '',
    description: item.description || '',
    notes: item.notes || '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  // `open` drives a symmetric enter/exit transition: the panel scales and
  // fades from its centre, and leaving reverses exactly that path.
  const [open, setOpen] = useState(false)
  const closingRef = useRef(false)
  const descriptionRef = useAutoResize()
  const notesRef = useAutoResize()
  const type = TYPES[item.typeId] ?? TYPES.other

  useEffect(() => {
    // Enter on the next frame so the hidden state paints first.
    const raf = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Every exit path runs the same reverse animation, then unmounts. */
  const requestClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    setOpen(false)
    setTimeout(onClose, CLOSE_MS)
  }

  const set = (field) => (e) => setDraft((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSave = () => {
    onSave(item.id, {
      date: draft.date || '',
      title: draft.title.trim() || item.name,
      description: draft.description.trim(),
      notes: draft.notes.trim(),
      dateSource: draft.date === item.date ? item.dateSource : 'manual',
    })
    requestClose()
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(item.id)
    requestClose()
  }

  return (
    <div
      className={`editor-overlay${open ? ' open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
    >
      <div className="editor-panel" role="dialog" aria-modal="true" aria-label={`Edit ${item.name}`}>
        <button type="button" className="editor-close" onClick={requestClose} aria-label="Close">
          &times;
        </button>
        <span className="evidence-type" style={{ '--type-color': type.color }}>
          {type.label}
        </span>
        <p className="editor-filename">{item.name}</p>
        <Preview item={item} />
        <AudioPreview item={item} />

        <label className="editor-label" htmlFor="editor-date">
          Date {formatDate(item.date) ? `(${formatDate(item.date)})` : ''}
        </label>
        <input
          id="editor-date"
          type="date"
          className="editor-input"
          value={draft.date}
          onChange={set('date')}
        />

        <label className="editor-label" htmlFor="editor-title">
          Title
        </label>
        <input
          id="editor-title"
          type="text"
          className="editor-input"
          placeholder="e.g. WhatsApp chat screenshot"
          value={draft.title}
          onChange={set('title')}
        />

        <label className="editor-label" htmlFor="editor-desc">
          Description
        </label>
        <textarea
          id="editor-desc"
          ref={descriptionRef}
          className="editor-textarea"
          rows={2}
          placeholder="What does this evidence show?"
          value={draft.description}
          onChange={set('description')}
        />

        <label className="editor-label" htmlFor="editor-notes">
          Extra info / notes
        </label>
        <textarea
          id="editor-notes"
          ref={notesRef}
          className="editor-textarea"
          rows={2}
          placeholder="Anything else worth remembering about this item..."
          value={draft.notes}
          onChange={set('notes')}
        />

        <div className="editor-actions">
          <button type="button" className="upload-label" onClick={handleSave}>
            save
          </button>
          <button type="button" className="btn-outline" onClick={requestClose}>
            cancel
          </button>
          <button
            type="button"
            className={`btn-danger${confirmDelete ? ' confirm' : ''}`}
            onClick={handleDelete}
          >
            {confirmDelete ? 'really delete?' : 'delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
