import { Link } from 'react-router-dom'

const features = [
  {
    to: '/fir-analysis',
    label: 'FIR to Plaintext',
    blurb: 'Upload an FIR and get a plain-English summary, the sections explained and clear next steps.',
  },
  {
    to: '/timeline-generator',
    label: 'Evidence Organizer',
    blurb: 'Drop in screenshots, voice notes, videos and documents — they are dated, described and laid out on an editable timeline.',
  },
  {
    to: '/section-finder',
    label: 'Section Finder',
    blurb: 'Describe your situation and find the law that applies to it, explained without the jargon.',
  },
  {
    to: '/know-your-rights',
    label: 'Know Your Rights',
    blurb: 'What to do when police stop you, refuse your FIR, when money is stolen online, or a college keeps your certificates. Plus an emergency card and helplines.',
  },
  {
    to: '/complaint-drafter',
    label: 'Draft a Letter',
    blurb: 'Turn your case into a formal complaint — consumer commission, police, RTI, university or landlord — ready to print, with your timeline evidence attached.',
  },
]

export default function Home() {
  return (
    <div className="page-narrow">
      <section className="hero">
        <h1>Nyaya</h1>
        <p>
          AI-powered legal tool that simplifies FIRs into plain-English summaries with
          explained legal sections and next steps. Includes an evidence organizer for
          uploading files like screenshots, audio, and notes, automatically creating a
          timeline. Also provides basic insights by identifying key elements and missing
          evidence.
        </p>
      </section>
      <section id="Features">
        <h2>Features</h2>
        <div className="cards-grid">
          {features.map(({ to, label, blurb }) => (
            <Link className="card card-link" to={to} key={to}>
              <h3>{label}</h3>
              <p className="card-blurb">{blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
