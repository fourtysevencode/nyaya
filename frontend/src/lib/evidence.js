import JSZip from 'jszip'

/**
 * Evidence type buckets. The `color` values must match the CSS custom
 * properties defined for them in index.css (--type-document etc.).
 */
export const TYPES = {
  document: { label: 'Document', folder: 'Documents', color: '#3e5c8a' },
  image: { label: 'Image', folder: 'Images', color: '#4e7a5a' },
  audio: { label: 'Audio', folder: 'Audio', color: '#b0603c' },
  video: { label: 'Video', folder: 'Video', color: '#7a4a63' },
  other: { label: 'Other', folder: 'Other', color: '#6b6b6b' },
}

export const TYPE_IDS = Object.keys(TYPES)

const EXT_TO_TYPE = {
  pdf: 'document', doc: 'document', docx: 'document', txt: 'document',
  odt: 'document', rtf: 'document',
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
  heic: 'image', heif: 'image', bmp: 'image', svg: 'image', avif: 'image',
  mp3: 'audio', wav: 'audio', m4a: 'audio', ogg: 'audio', flac: 'audio', aac: 'audio',
  mp4: 'video', mov: 'video', avi: 'video', mkv: 'video', webm: 'video', hevc: 'video',
}

export function detectType(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  let typeId = EXT_TO_TYPE[ext] ?? 'other'
  if (typeId === 'other' && file.type) {
    if (file.type.startsWith('image/')) typeId = 'image'
    else if (file.type.startsWith('audio/')) typeId = 'audio'
    else if (file.type.startsWith('video/')) typeId = 'video'
    else if (file.type === 'application/pdf' || file.type === 'text/plain' || file.type.includes('document')) {
      typeId = 'document'
    }
  }
  return typeId
}

const pad = (n) => String(n).padStart(2, '0')

/** Local date (YYYY-MM-DD) taken from a file's last-modified timestamp. */
export function fileDate(file) {
  const d = new Date(file.lastModified)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "2024-03-15" -> "15 Mar 2024"; empty string stays empty. */
export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Strip anything unsafe for a zip entry name, keep the extension. */
export function sanitizeName(name) {
  const clean = (name || 'file')
    .split(/[\\/]/)
    .pop()
    .replace(/[\p{Cc}]/gu, '')
    .replace(/[<>:"|?*]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return clean || 'file'
}

function csvCell(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

/**
 * Build the downloadable archive. Layout (newest evidence first):
 *
 *   Evidence/
 *     README.txt            - explains the layout
 *     index.csv             - one row per item: path, date, type, notes...
 *     2024-03-15/
 *       Documents/2024-03-15_document_fir-copy.pdf
 *     2024-03-16/
 *       Images/2024-03-16_image_chat-screenshot.jpg
 *     Undated/
 *       Audio/undated_audio_voice-note.mp3
 *
 * Every file is renamed with its date and type so folders stay sorted and
 * self-describing once extracted.
 */
export async function buildEvidenceZip(items) {
  const zip = new JSZip()

  const sorted = [...items].sort(
    (a, b) => (b.date || '0000-00-00').localeCompare(a.date || '0000-00-00'),
  )

  const manifest = [['file_path', 'original_name', 'date', 'type', 'title', 'description', 'notes']]
  const usedPaths = new Set()

  for (const item of sorted) {
    const type = TYPES[item.typeId] ?? TYPES.other
    const dateDir = item.date || 'Undated'
    const datePrefix = item.date || 'undated'

    const original = sanitizeName(item.name)
    const dot = original.lastIndexOf('.')
    const stem = dot > 0 ? original.slice(0, dot) : original
    const ext = dot > 0 ? original.slice(dot) : ''

    const folder = `Evidence/${dateDir}/${type.folder}`
    let name = `${datePrefix}_${item.typeId}_${stem}${ext}`
    let counter = 1
    while (usedPaths.has(`${folder}/${name}`)) {
      name = `${datePrefix}_${item.typeId}_${stem} (${counter++})${ext}`
    }
    const path = `${folder}/${name}`
    usedPaths.add(path)

    zip.file(path, item.blob)
    manifest.push([
      path,
      item.name,
      item.date || '',
      type.label,
      item.title || '',
      item.description || '',
      item.notes || '',
    ])
  }

  zip.file('Evidence/index.csv', `${manifest.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`)
  zip.file(
    'Evidence/README.txt',
    [
      'Nyaya - Evidence Archive',
      `Generated: ${new Date().toISOString()}`,
      `Items: ${sorted.length}`,
      '',
      'How this archive is organised:',
      '- Evidence/<date>/<type>/ holds every item, grouped by day and type.',
      '  Items with no confirmed date are under Evidence/Undated/.',
      '- Files are renamed <date>_<type>_<original name> so they sort',
      '  chronologically and stay self-describing.',
      '- index.csv lists every item with its original filename, date, type,',
      '  title, description and any notes added in the timeline.',
      '',
      'Generated by Nyaya (https://nyaya.ronakbuilds.tech).',
    ].join('\r\n'),
  )

  return zip.generateAsync({ type: 'blob' })
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
