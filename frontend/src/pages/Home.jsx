const features = ['FIR to Plaintext', 'Evidence Organizer', 'Case Insights']

export default function Home() {
  return (
    <>
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
          {features.map((feature) => (
            <div className="card" key={feature}>
              <h3>{feature}</h3>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
