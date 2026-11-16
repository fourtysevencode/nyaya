# Nyaya

## Local dev

```
npm install
npm start
```

This spins up both the FastAPI backend (`uvicorn` on port 8000) and the Vite React dev server (port 5173, proxying API calls to the backend).

`npm run build` builds the frontend into `frontend/dist/`, which FastAPI serves in production.

## Legacy

The old Jinja templates are kept in `old_templates/`.
