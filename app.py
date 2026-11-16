from fastapi import FastAPI, Request, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
import os
import base64
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nyaya.ronakbuilds.tech",
        "http://localhost:8000" # for local dev
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

load_dotenv()

OPENAI_API_KEY = os.getenv("API_KEY")
client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# Built React (Vite) frontend is served as a static SPA
DIST_DIR = Path("frontend/dist")
app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")
app.mount("/favicon", StaticFiles(directory=DIST_DIR / "favicon"), name="favicon")


async def serve_spa(full_path: str):
    """Serve the built SPA. Known routes get index.html from the top level,
    anything else gets the app's 404 page."""
    page = DIST_DIR / f"{full_path}.html"
    if page.is_file():
        return FileResponse(page)
    index = DIST_DIR / "index.html"
    if index.is_file():
        return FileResponse(index)
    return JSONResponse(status_code=404, content={"detail": "Frontend not built. Run `npm run build` in frontend/."})

prompt = """
You are a legal assistant helping ordinary Indian citizens understand FIR (First Information Report) documents.
Analyze the uploaded FIR document and respond in the following structure:
1. SUMMARY
Write a plain English summary of what this FIR is about in 3-5 sentences. Avoid legal jargon. Write as if explaining to someone with no legal background.
2. PEOPLE INVOLVED
List the key people mentioned: complainant, accused, witnesses. Keep it brief.
3. LEGAL SECTIONS
For each IPC/BNS section mentioned in the FIR:
- Section number
- What it means in plain English
- Maximum punishment under this section
4. TIMELINE OF EVENTS
List the events described in the FIR in chronological order as bullet points.
5. NEXT STEPS
What should the complainant do next? List 3-5 practical, actionable steps in simple language.
6. MISSING INFORMATION
What important information seems to be missing from this FIR that could strengthen the case?
Be concise, clear, and compassionate. The person reading this may be in a stressful situation.
"""

@app.get("/", response_class=HTMLResponse)
async def home():
    return await serve_spa("index")

@app.get("/fir-analysis", response_class=HTMLResponse)
async def fir_analysis_page():
    return await serve_spa("fir-analysis")

@app.get("/section-finder", response_class=HTMLResponse)
async def section_finder_page():
    return await serve_spa("section-finder")

@app.get("/timeline-generator", response_class=HTMLResponse)
async def timeline_generator_page():
    return await serve_spa("timeline-generator")

@app.get("/{path:path}", response_class=HTMLResponse)
async def spa_fallback(path: str):
    return await serve_spa(path)

@app.post("/fir_analysis")
async def analysis(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_pdf = base64.b64encode(contents).decode("utf-8")
        data_url = f"data:application/pdf;base64,{base64_pdf}"
        response = client.chat.completions.create(
            model="openrouter/free",
            max_tokens=3000,
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this FIR document."},
                        {
                            "type": "file",
                            "file": {
                                "filename": file.filename or "fir.pdf",
                                "file_data": data_url,
                            },
                        },
                    ],
                },
            ],
            extra_body={
                "plugins": [
                    {
                        "id": "file-parser",
                        "pdf": {"engine": "pdf-text"},
                    }
                ]
            },
        )
        return {"analysis": response.choices[0].message.content}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )