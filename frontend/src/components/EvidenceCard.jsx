import { useState } from 'react'
import { useObjectUrl } from '../hooks/useObjectUrl.js'
import { TYPES, formatDate } from '../lib/evidence.js'

function Thumb({ item }) {
  const url = useObjectUrl(item.blob)
  const type = TYPES[item.typeId] ?? TYPES.other
  // iPhone photos are HEIC/HEIF, which many browsers can't paint — fall back
  // to a plain file block instead of a broken image.
  const [broken, setBroken] = useState(false)

  if (!url) return null
  if (item.typeId === 'image' && !broken) {
    return (
      <img
        className="evidence-thumb"
        src={url}
        alt={item.title || item.name}
        onError={() => setBroken(true)}
      />
    )
  }
  if (item.typeId === 'video') {
    // #t=0.1 nudges browsers into showing the first frame as the poster.
    return <video className="evidence-thumb" src={`${url}#t=0.1`} muted preload="metadata" />
  }
  if (item.typeId === 'audio') {
    return (
      <div className="evidence-audio" style={{ '--type-color': type.color }}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6Z"
          />
        </svg>
        <span className="evidence-audio-name">{item.name}</span>
      </div>
    )
  }
  if (item.typeId === 'document') {
    return (
      <div className="evidence-fileblock" style={{ '--type-color': type.color }}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13Z"
          />
        </svg>
        <span className="evidence-fileblock-name">{item.name}</span>
      </div>
    )
  }
  return (
    <div className="evidence-fileblock" style={{ '--type-color': type.color }}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M13 9h5.5L13 3.5V9ZM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm9 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1 4.9a5 5 0 1 0-4 0V22h4v-4.1Z"
        />
      </svg>
      <span className="evidence-fileblock-name">{item.name}</span>
    </div>
  )
}

const DATE_SOURCE_LABEL = {
  ai: 'AI date',
  file: 'file date',
  manual: 'edited',
}

export default function EvidenceCard({ item, onEdit }) {
  const type = TYPES[item.typeId] ?? TYPES.other
  const isWorking = item.status === 'queued' || item.status === 'reading'

  return (
    <article
      className="evidence-card"
      style={{ '--type-color': type.color }}
      onClick={() => onEdit(item.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit(item.id)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${item.title || item.name}`}
    >
      <Thumb item={item} />
      <div className="evidence-body">
        <div className="evidence-badges">
          <span className="evidence-type">{type.label}</span>
          <span className="evidence-date-chip">{formatDate(item.date) || 'no date'}</span>
          {!isWorking && (
            <span className="evidence-date-source">{DATE_SOURCE_LABEL[item.dateSource] ?? 'file date'}</span>
          )}
          {isWorking && <span className="evidence-reading">reading&hellip;</span>}
          {item.status === 'failed' && <span className="evidence-failed">AI unavailable</span>}
          {item.status === 'unreadable' && <span className="evidence-unreadable">couldn't read file</span>}
        </div>
        <h3 className="evidence-title">{item.title || item.name}</h3>
        {item.description && <p className="evidence-desc">{item.description}</p>}
        {item.notes && (
          <p className="evidence-notes">
            <span>Note</span>
            {item.notes}
          </p>
        )}
      </div>
    </article>
  )
}
