# Nyaya

## Local dev

```
npm install
npm start
```

This spins up both the FastAPI backend (`uvicorn` on port 8000) and the Vite React dev server (port 5173, proxying API calls to the backend).

`npm run build` builds the frontend into `frontend/dist/`, which FastAPI serves in production.

## Deployment (Vercel)

`vercel.json` builds the frontend and serves it as a static SPA. `/fir_analysis`
requests are rewritten to the deployed backend (`nyaya.ronakbuilds.tech`). If the
backend runs on a different host, update that rewrite destination. Also make sure
the backend CORS list includes the Vercel deployment domain.

## Legacy

The old Jinja templates are kept in `old_templates/`.
