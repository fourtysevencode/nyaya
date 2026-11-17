from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
import os
import ast
import base64
import json
import logging
import re
from datetime import datetime
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

logger = logging.getLogger("nyaya")

OPENAI_API_KEY = os.getenv("API_KEY")
client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# Built React (Vite) frontend is served as a static SPA.
# Mounts are created lazily so the backend can still run before the
# frontend has been built (`npm run build` in frontend/).
DIST_DIR = Path("frontend/dist")


def mount(name: str, path: str):
    directory = DIST_DIR / path
    if directory.is_dir():
        app.mount(f"/{name}", StaticFiles(directory=directory), name=name)


mount("assets", "assets")
mount("favicon", "favicon")


async def serve_spa(full_path: str):
    """Serve the built SPA. Known routes get index.html from the top level,
    anything else gets the app's 404 page."""
    index = DIST_DIR / "index.html"
    if not index.is_file():
        return JSONResponse(
            status_code=503,
            content={"detail": "Frontend not built. Run `npm install && npm run build --prefix frontend`."},
        )
    page = DIST_DIR / f"{full_path}.html"
    if page.is_file():
        return FileResponse(page)
    return FileResponse(index)

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


timeline_prompt = """
You are a legal evidence assistant helping ordinary Indian citizens organize the
evidence for their case. You are given one evidence file (a document or an image).
Extract the following and respond with ONLY a single valid JSON object, no
markdown fences, no extra text:
{"date": "YYYY-MM-DD" or null, "title": "...", "description": "..."}
Rules:
- "date": the single date most relevant to the event this evidence documents
  (when the incident, message, transaction or record happened - NOT the date it
  was printed, scanned or uploaded). If the file contains several dates, pick the
  one of the actual event. If no date can be determined at all, use null.
- "title": a short human label for this evidence, maximum 6 words.
- "description": what this evidence shows, in plain English, maximum 30 words.
"""


def _parse_model_json(text: str) -> dict:
    """Best-effort extraction of a JSON object from a model response."""
    text = (text or "").strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        return {}
    snippet = text[start : end + 1]
    try:
        data = json.loads(snippet)
        return data if isinstance(data, dict) else {}
    except ValueError:
        pass
    # Free models sometimes answer in Python literals ('single quotes').
    try:
        data = ast.literal_eval(snippet)
        return data if isinstance(data, dict) else {}
    except (ValueError, SyntaxError):
        return {}


_DATE_FORMATS = (
    "%d/%m/%Y",
    "%d-%m-%Y",
    "%d %B %Y",
    "%d %b %Y",
    "%B %d, %Y",
    "%b %d, %Y",
    "%d.%m.%Y",
    "%Y/%m/%d",
)


def _normalise_date(value) -> str | None:
    """Coerce a model-returned date into YYYY-MM-DD, or None."""
    if not isinstance(value, str):
        return None
    text = value.strip()
    if not text or text.lower() in {"null", "none", "unknown", "n/a", "na"}:
        return None
    try:
        return datetime.fromisoformat(text[:10]).date().isoformat()
    except ValueError:
        pass
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            continue
    logger.warning("timeline: could not normalise model date %r", text)
    return None


@app.post("/timeline_analyze")
async def timeline_analyze(file: UploadFile = File(...), hint_date: str = Form("")):
    """Suggest a date, title and short description for one evidence file.

    PDFs and images are read by the model; anything else (audio, video, docx...)
    can't be read by the free model, so the client falls back to the file's own
    metadata and the user edits it in the timeline.
    """
    try:
        contents = await file.read()
        content_type = file.content_type or ""
        filename = (file.filename or "evidence").lower()

        if content_type.startswith("image/"):
            base64_file = base64.b64encode(contents).decode("utf-8")
            messages = [
                {"role": "system", "content": timeline_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract the date, title and description of this evidence image."},
                        {"type": "image_url", "image_url": {"url": f"data:{content_type};base64,{base64_file}"}},
                    ],
                },
            ]
            extra_body = {}
            supported = True
        elif content_type == "application/pdf" or filename.endswith(".pdf"):
            base64_file = base64.b64encode(contents).decode("utf-8")
            messages = [
                {"role": "system", "content": timeline_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract the date, title and description of this evidence document."},
                        {
                            "type": "file",
                            "file": {
                                "filename": file.filename or "evidence.pdf",
                                "file_data": f"data:application/pdf;base64,{base64_file}",
                            },
                        },
                    ],
                },
            ]
            extra_body = {
                "plugins": [
                    {
                        "id": "file-parser",
                        "pdf": {"engine": "pdf-text"},
                    }
                ]
            }
            supported = True
        else:
            # Model can't read this kind of file.
            return {"supported": False, "date": None, "title": "", "description": ""}

        response = client.chat.completions.create(
            model="openrouter/free",
            max_tokens=1000,
            messages=messages,
            extra_body=extra_body,
        )
        raw = response.choices[0].message.content
        logger.info("timeline: raw model output for %s: %r", filename, (raw or "")[:500])
        data = _parse_model_json(raw)
        if not data:
            logger.warning("timeline: could not parse model output for %s", filename)
        return {
            "supported": supported,
            "date": _normalise_date(data.get("date")),
            "title": (data.get("title") or "").strip(),
            "description": (data.get("description") or "").strip(),
        }
    except Exception as e:
        logger.exception("timeline_analyze failed for %s", locals().get("filename", "?"))
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )