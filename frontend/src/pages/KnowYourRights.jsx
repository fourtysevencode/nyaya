import { useEffect, useState } from 'react'
import { loadProfile, saveProfile } from '../lib/profileStore.js'
import { EMERGENCY_FIELDS, HELPLINES, RIGHT_CARDS } from '../lib/rights.js'

const EMPTY_PROFILE = Object.fromEntries(EMERGENCY_FIELDS.map((f) => [f.id, '']))

export default function KnowYourRights() {
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadProfile()
      .then((value) => setProfile(value ?? EMPTY_PROFILE))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const setField = (id) => (e) => {
    setProfile((prev) => ({ ...prev, [id]: e.target.value }))
    setSaved(false)
  }

  const handleSave = () => {
    saveProfile(profile)
      .then(() => setSaved(true))
      .catch(() => setSaved(false))
  }

  return (
    <div className="page-narrow">
      <h2 id="fir_title">Know Your Rights</h2>
      <p id="fir-subtext">
        Plain-English answers for the moments that matter — being stopped by police, an
        unfair arrest, a refused FIR, online fraud, a college holding your certificates.
        Everything below is general information, not legal advice; when in doubt, a free
        lawyer is a phone call away (15100).
      </p>

      <section className="rights-list">
        {RIGHT_CARDS.map((card, i) => (
          <details key={card.id} className="rights-card" open={i === 0}>
            <summary>{card.title}</summary>
            <p className="rights-summary">{card.summary}</p>
            <ul className="rights-points">
              {card.points.map((point) => (
                <li key={point.h}>
                  <strong>{point.h}</strong>
                  <span>{point.t}</span>
                </li>
              ))}
            </ul>
            <p className="rights-cite">Grounded in: {card.cite}</p>
          </details>
        ))}
      </section>

      <section className="helplines">
        <h3>Save these numbers now</h3>
        <div className="helpline-grid">
          {HELPLINES.map(({ number, label }) => (
            <a key={number} className="helpline" href={`tel:${number.replace(/-/g, '')}`}>
              <span className="helpline-number">{number}</span>
              <span className="helpline-label">{label}</span>
            </a>
          ))}
        </div>
        <p className="helpline-note">
          Tap any card to call straight away. Save 112 and 1930 in your favourites — in the
          first hour of a fraud, minutes matter.
        </p>
      </section>

      <section className="emergency">
        <h3>Your emergency card</h3>
        <p className="emergency-sub">
          Fill this in once and keep it saved in this browser. If you are ever detained or
          taken to hospital, anyone with your phone can show it — it stays on your device
          and is never uploaded anywhere.
        </p>
        <div id="print-target">
          <div className="emergency-card">
            <span className="emergency-card-title">Emergency card</span>
            {loaded && (profile.fullName || profile.contactPerson) ? (
              <dl className="emergency-grid">
                {EMERGENCY_FIELDS.filter((f) => profile[f.id]).map((f) => (
                  <div key={f.id}>
                    <dt>{f.label}</dt>
                    <dd>{profile[f.id]}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="emergency-empty">
                Fill the form below and press save — your card will appear here.
              </p>
            )}
          </div>
        </div>
        <div className="emergency-fields">
          {EMERGENCY_FIELDS.map((field) => (
            <div className="emergency-field" key={field.id}>
              <label className="editor-label" htmlFor={`em-${field.id}`}>
                {field.label}
                {field.required ? ' *' : ''}
              </label>
              <input
                id={`em-${field.id}`}
                className="editor-input"
                type="text"
                value={profile[field.id]}
                onChange={setField(field.id)}
              />
            </div>
          ))}
        </div>
        <div className="emergency-actions">
          <button type="button" className="upload-label" onClick={handleSave}>
            save card
          </button>
          <button type="button" className="btn-outline" onClick={() => window.print()}>
            print
          </button>
          {saved && <span className="emergency-saved">saved on this device</span>}
        </div>
      </section>

      <p className="rights-disclaimer">
        Nyaya shares general legal information for awareness. Laws change and every case is
        different — for anything that matters, speak to a lawyer or your District Legal
        Services Authority (15100).
      </p>
    </div>
  )
}
