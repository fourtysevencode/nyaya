import { useState } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useAutoResize } from '../hooks/useAutoResize.js'

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  DONE: 'done',
}

export default function SectionFinder() {
  const textareaRef = useAutoResize()
  const [situation, setSituation] = useState('')
  const [status, setStatus] = useState(STATUS.IDLE)
  const [message, setMessage] = useState(
    'Describe what happened below — you will get the sections that may apply, what they mean, and what to do next.'
  )
  const [analysis, setAnalysis] = useState('')

  const handleAnalyze = async () => {
    const text = situation.trim()
    if (!text) {
      setStatus(STATUS.ERROR)
      setAnalysis('')
      setMessage('Please describe your situation first — even a few short sentences help.')
      return
    }

    setStatus(STATUS.LOADING)
    setAnalysis('')
    setMessage('Finding the sections that may apply...')

    try {
      const res = await fetch('/section_analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: text }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        const error = data.error ?? `Request failed with status ${res.status}`
        setMessage(
          error.includes('503') || error.includes('high demand')
            ? "There's high demand right now. Please retry in a minute."
            : `Something went wrong: ${error}`
        )
        setStatus(STATUS.ERROR)
        return
      }

      // Model output is never trusted raw — it is sanitised before rendering.
      setAnalysis(DOMPurify.sanitize(marked.parse(data.analysis)))
      setStatus(STATUS.DONE)
      setMessage('')
    } catch {
      setMessage('Something went wrong. Please check your connection and try again.')
      setStatus(STATUS.ERROR)
    }
  }

  return (
    <div className="page-narrow">
      <h2 id="fir_title">Section Finder</h2>
      <p id="fir-subtext">
        Describe your situation in your own words and find out which sections of Indian
        law may apply, what each one means in plain English, and your practical next
        steps.
      </p>

      <div className="field">
        <textarea
          ref={textareaRef}
          id="incident-report"
          rows={3}
          placeholder="e.g. my neighbour broke into my house at night and threatened me with a knife..."
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          aria-label="Describe your situation"
        />
      </div>

      <button
        type="button"
        id="upload-btn"
        className="upload-label"
        onClick={handleAnalyze}
        disabled={status === STATUS.LOADING}
      >
        {status === STATUS.LOADING ? 'finding sections...' : 'find sections'}
      </button>
      <p className="outputs">
        Nothing is uploaded or stored — your description goes to the analysis model and
        nowhere else.
      </p>

      <div className="output_bg">
        {analysis ? (
          <article
            id="result"
            className="outputs"
            dangerouslySetInnerHTML={{ __html: analysis }}
          />
        ) : (
          <p id="result" className={`outputs${status === STATUS.ERROR ? ' error' : ''}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
