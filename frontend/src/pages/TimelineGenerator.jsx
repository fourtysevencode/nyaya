import { useRef, useState } from 'react'

export default function TimelineGenerator() {
  const inputRef = useRef(null)
  const [fileNames, setFileNames] = useState([])

  const handleFileChange = () => {
    let fileNamesArray = Array.from(inputRef.current.files).map((f) => f.name)
    setFileNames(fileNamesArray)
    console.log(fileNamesArray)
  }

  // React element
  return (
    <>
      <h2 id="fir_title">Timeline Generator</h2>
      <p id="fir-subtext">Upload all applicable evidence and view a timeline of it.</p>
      <div className="field">
        <label htmlFor="timeline_input" className="upload-label">
          choose file
        </label>
        <input
          ref={inputRef}
          type="file"
          id="timeline_input"
          accept=".pdf, .docx, .mp3, .mp4, .jpeg, .jpg, .png, .wav, .mov, .heif, .heic"
          onChange={handleFileChange}
          multiple
        />
        {fileNames.map((name) => (
          <p key={name} className="outputs">
            {name}
          </p>
        ))}
      </div>
    </>
  )
}
