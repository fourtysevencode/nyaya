import { useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  DONE: 'done',
}

export default function FirAnalysis() {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(STATUS.IDLE)
  const [message, setMessage] = useState('Start by uploading an FIR')
  const [analysis, setAnalysis] = useState('')

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setStatus(STATUS.IDLE)
    setAnalysis('')
    setMessage(e.target.files[0]?.name ?? 'No file selected')
  }

  const handleAnalyze = async () => {
    if (!file) {
      setStatus(STATUS.ERROR)
      setMessage('No file uploaded. Please choose a PDF first.')
      return
    }

    setStatus(STATUS.LOADING)
    setAnalysis('')
    setMessage('Analyzing your FIR...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/fir_analysis', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        const error = data.error ?? `Request failed with status ${res.status}`
        setMessage(
          error.includes('503')
            ? "There's high demand right now. Please retry in a minute."
            : `Something went wrong: ${error}`,
        )
        setStatus(STATUS.ERROR)
        return
      }

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
      <h2 id="fir_title">FIR Analysis</h2>
      <p id="fir-subtext">Upload any FIR as a PDF and get a detailed summary!</p>

      <section>
        <label htmlFor="fir_input" className="upload-label">
          choose file
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="fir_input"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <button type="button" id="upload-btn" className="upload-label" onClick={handleAnalyze} disabled={status === STATUS.LOADING}>
          {status === STATUS.LOADING ? 'analyzing...' : 'analyze'}
        </button>
        <p className="outputs">{file?.name ?? 'No file selected'}</p>
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
      </section>
    </div>
  )
}
