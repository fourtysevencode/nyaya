import { useAutoResize } from '../hooks/useAutoResize.js'

export default function SectionFinder() {
  const textareaRef = useAutoResize()

  return (
    <>
      <h2 id="fir_title">Section Finder</h2>
      <p id="fir-subtext">
        Describe your situation and find out what IPC sections are applicable.
      </p>
      <div className="field">
        <textarea
          ref={textareaRef}
          id="incident-report"
          rows={2}
          placeholder="e.g. my neighbor broke into my house at night and threatened me with a knife..."
        />
      </div>
    </>
  )
}
