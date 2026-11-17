# Nyaya

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
  public paths `POST /fir_analysis` and `POST /timeline_analyze`

The frontend's `/fir_analysis` and `/timeline_analyze` fetches resolve against
the public origin and are routed to the backend by Vercel — no CORS and no
bindings involved. Set `API_KEY` in the project's environment variables in the
Vercel dashboard.

## Legacy

The old Jinja templates are kept in `old_templates/`.
