import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EvidenceCard from '../components/EvidenceCard.jsx'
import EvidenceEditor from '../components/EvidenceEditor.jsx'
import { loadItems, saveItem, deleteItem } from '../lib/evidenceStore.js'
import {
  TYPES,
  TYPE_IDS,
  buildEvidenceZip,
  detectType,
  downloadBlob,
  fileDate,
  formatDate,
  todayISO,
} from '../lib/evidence.js'

const ACCEPT =
  '.pdf, .doc, .docx, .mp3, .mp4, .jpeg, .jpg, .png, .gif, .webp, .wav, .m4a, .mov, .heif, .heic, .webm, .txt'

export default function TimelineGenerator() {
  const inputRef = useRef(null)
  // Files are analysed one at a time through this promise chain so we don't
  // hammer the (rate-limited) free model with parallel requests.
  const analysisChain = useRef(Promise.resolve())

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [zipping, setZipping] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadItems()
      .then((list) => setItems(list))
      .catch(() => setMessage('Could not read your saved evidence from this browser.'))
      .finally(() => setLoading(false))
  }, [])

  /** Merge a patch into one item and persist it. */
  const patchItem = useCallback((id, patch) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      const updated = next.find((item) => item.id === id)
      if (updated) saveItem(updated).catch(() => {})
      return next
    })
  }, [])

  /** Ask the backend for a date/title/description, fall back to file metadata. */
  const analyzeItem = useCallback(
    async (item) => {
      patchItem(item.id, { status: 'reading' })
      try {
        const formData = new FormData()
        formData.append('file', item.blob, item.name)
        formData.append('hint_date', item.date || '')
        const res = await fetch('/timeline_analyze', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || `status ${res.status}`)

        const patch = { status: 'ready' }
        if (data.supported) {
          if (data.date) {
            patch.date = data.date
            patch.dateSource = 'ai'
          } else {
            patch.dateSource = 'file'
          }
          if (data.title) patch.title = data.title
          if (data.description) patch.description = data.description
          // Model answered but couldn't pull anything out of the file —
          // surface it on the card instead of failing silently.
          if (!data.date && !data.title && !data.description) patch.status = 'unreadable'
        }
        patchItem(item.id, patch)
      } catch {
        patchItem(item.id, { status: 'failed', dateSource: 'file' })
      }
    },
    [patchItem],
  )

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList)
      if (!files.length) return
      setMessage('')

      const created = files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        blob: file,
        mime: file.type,
        size: file.size,
        typeId: detectType(file),
        date: fileDate(file),
        dateSource: 'file',
        title: file.name.replace(/\.[^.]+$/, '') || file.name,
        description: '',
        notes: '',
        status: 'queued',
        createdAt: Date.now(),
      }))

      setItems((prev) => [...prev, ...created])
      created.forEach((item) => {
        saveItem(item).catch(() => {})
        analysisChain.current = analysisChain.current.then(() => analyzeItem(item))
      })
    },
    [analyzeItem],
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setDragOver(false)
  }

  const handleSaveEdits = (id, patch) => patchItem(id, patch)

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    deleteItem(id).catch(() => {})
  }

  const handleDownload = async () => {
    setZipping(true)
    setMessage('')
    try {
      const blob = await buildEvidenceZip(items)
      downloadBlob(blob, `nyaya-evidence-${todayISO()}.zip`)
    } catch {
      setMessage('Could not build the ZIP file. Please try again.')
    } finally {
      setZipping(false)
    }
  }

  const visible = useMemo(() => {
    const list = filter === 'all' ? [...items] : items.filter((item) => item.typeId === filter)
    return list.sort(
      (a, b) => (a.date || '9999-99-99').localeCompare(b.date || '9999-99-99') || a.createdAt - b.createdAt,
    )
  }, [items, filter])

  const counts = useMemo(() => {
    const tally = { all: items.length }
    for (const item of items) tally[item.typeId] = (tally[item.typeId] ?? 0) + 1
    return tally
  }, [items])

  const editing = items.find((item) => item.id === editingId) ?? null

  return (
    <div className="page-narrow">
      <h2 id="fir_title">Timeline Generator</h2>
      <p id="fir-subtext">
        Upload all your evidence — documents, screenshots, voice notes, videos. Each item is dated
        (by AI where possible, otherwise by the file itself), colour-coded by type and laid out on a
        timeline you can edit. Everything stays in your browser.
      </p>

      <div
        className={`dropzone${dragOver ? ' dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="dropzone-title">Drop your evidence here</p>
        <p className="dropzone-sub">as many files as you have — they never leave your device</p>
        <label htmlFor="timeline_input" className="upload-label">
          choose files
        </label>
        <input
          ref={inputRef}
          type="file"
          id="timeline_input"
          accept={ACCEPT}
          multiple
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {message && <p className="outputs error timeline-message">{message}</p>}

      {items.length > 0 && (
        <div className="timeline-toolbar">
          <div className="timeline-filters" role="group" aria-label="Filter by type">
            {['all', ...TYPE_IDS].map((id) => (
              <button
                key={id}
                type="button"
                className={`filter-chip${filter === id ? ' active' : ''}`}
                style={id !== 'all' ? { '--type-color': TYPES[id].color } : undefined}
                onClick={() => setFilter(id)}
              >
                {id === 'all' ? 'All' : TYPES[id].label}
                <span className="chip-count">{counts[id] ?? 0}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="upload-label zip-btn"
            onClick={handleDownload}
            disabled={zipping}
          >
            {zipping ? 'packing...' : 'download zip'}
          </button>
        </div>
      )}

      {loading ? (
        <p className="outputs">Loading your evidence...</p>
      ) : visible.length === 0 ? (
        <p className="outputs timeline-empty">
          {items.length === 0
            ? 'Nothing here yet — your timeline will appear once you add evidence.'
            : 'No evidence of this type yet.'}
        </p>
      ) : (
        <section className="timeline">
          <ol className="timeline-list">
            {visible.map((item) => (
              <li key={item.id} className="timeline-item">
                <div className="timeline-spine">
                  <span className="timeline-when">{formatDate(item.date) || 'undated'}</span>
                  <span className="timeline-node" style={{ '--type-color': (TYPES[item.typeId] ?? TYPES.other).color }} />
                </div>
                <EvidenceCard item={item} onEdit={setEditingId} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {editing && (
        <EvidenceEditor
          item={editing}
          onClose={() => setEditingId(null)}
          onSave={handleSaveEdits}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
