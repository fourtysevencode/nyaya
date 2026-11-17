# Nyaya

AI-powered legal help for ordinary Indian citizens and students — FIRs explained,
evidence organised, rights made plain, and letters that get taken seriously.

## Features

- **FIR Analysis** (`/fir-analysis`) — upload an FIR and get a plain-English
  summary, the sections explained and practical next steps.
- **Section Finder** (`/section-finder`) — describe your situation and get the
  BNS/IPC sections that may apply, each explained in plain language, with next
  steps (backend: `POST /section_analysis`).
- **Timeline Generator** (`/timeline-generator`) — drop in evidence (documents,
  screenshots, voice notes, video); each item is dated and described (AI where
  possible, file metadata otherwise) and laid out on an editable timeline.
  Everything stays in the browser (IndexedDB), exportable as a ZIP.
- **Know Your Rights** (`/know-your-rights`) — plain-language cards for police
  stops, arrests (D.K. Basu safeguards), refused FIRs, cyber fraud, consumer
  disputes, student fee/certificate/ragging issues, women's safety and free
  legal aid, plus verified helplines and a printable offline emergency card.
- **Draft a Letter** (`/complaint-drafter`) — turn your situation into a formal
  complaint/application (consumer commission, police, RTI, university grievance,
  landlord deposit notice) with the relevant statutes cited, enclosures pulled
  from your timeline, and copy/download/print output. Works fully offline —
  no AI required.

## Local dev

```
npm install
npm start
```

This spins up both the FastAPI backend (`uvicorn` on port 8000) and the Vite React dev server (port 5173, proxying API calls to the backend).

`npm run build` builds the frontend into `frontend/dist/`, which FastAPI serves in production.

## Deployment (Vercel)

Vercel deploys this repo as one project with two services (`vercel.json`):

- **`frontend`** — Vite/React app in `frontend/`, public and serving everything (catch-all `/`)
- **`app`** — FastAPI backend at the repo root, internal; reachable only via the
  public paths `POST /fir_analysis`, `POST /timeline_analyze` and
  `POST /section_analysis`

The frontend's `/fir_analysis` and `/timeline_analyze` fetches resolve against
the public origin and are routed to the backend by Vercel — no CORS and no
bindings involved. Set `API_KEY` in the project's environment variables in the
Vercel dashboard.

## Legacy

The old Jinja templates are kept in `old_templates/`.
