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


@app.post("/section_analysis")
async def section_analysis(request: Request):
    """Suggest the Indian law sections that may apply to a described situation.

    Input is JSON: {"situation": "..."}. Output is markdown, the same shape as
    /fir_analysis returns, so the client can render and sanitise it the same way.
    """
    try:
        body = await request.json()
        situation = str(body.get("situation") or "").strip()
        if not situation:
            return JSONResponse(
                status_code=400,
                content={"error": "Please describe your situation first."},
            )
        if len(situation) > 4000:
            situation = situation[:4000]

        response = client.chat.completions.create(
            model="openrouter/free",
            max_tokens=2000,
            messages=[
                {"role": "system", "content": sections_prompt},
                {"role": "user", "content": situation},
            ],
        )
        # Free models answer in odd shapes (content lists, reasoning-only);
        # _message_text handles those, same as the timeline endpoint.
        analysis = _strip_fence(_message_text(response.choices[0].message))
        if not analysis:
            return JSONResponse(
                status_code=502,
                content={"error": "The analysis came back empty. Please try again."},
            )
        return {"analysis": analysis}
    except Exception as e:
        logger.exception("section_analysis failed")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


# Plain-language legal sections for a described situation (Section Finder).
sections_prompt = """
You are a legal assistant helping ordinary Indian citizens understand which laws
apply to their situation. The user describes what happened to them in their own
words. Respond ONLY in markdown, in this exact structure:

## What likely happened
One or two plain-English sentences reflecting the situation back, without judgement.

## Sections that may apply
For each applicable section of Indian law (prefer the BNS/BNSS 2023 numbering,
mentioning the old IPC equivalent in brackets, since most people know those numbers):
- **Section number — short name**: what it means in plain English, and why it may
  fit this situation.

## What you can do next
3-5 practical steps in simple language (police complaint, evidence to keep and
where, which authority to approach).

## Important
One short paragraph: this is general information, not legal advice; the exact
section depends on the facts; a free lawyer is available through the District
Legal Services Authority (helpline 15100).

Rules:
- Write for someone with no legal background; explain any jargon you use.
- Only include sections you are confident about. Never invent section numbers.
- Say plainly when key facts are missing and which sections would depend on them.
- Be concise and compassionate — the reader may be in a stressful situation.
"""

timeline_prompt = """
You are a legal evidence assistant helping ordinary Indian citizens organize the
evidence for their case. You are given one evidence file (a document or an image).
Extract the following and respond with ONLY a single valid JSON object, no
markdown fences, no extra text:
{"date": "YYYY-MM-DD" or null, "title": "...", "description": "..."}
Rules:
- Use straight double quotes and valid JSON - no markdown, no trailing commas.
- "date": the single date most relevant to the event this evidence documents
  (when the incident, message, transaction or record happened - NOT the date it
  was printed, scanned or uploaded). If the file contains several dates, pick the
  one of the actual event. If no date can be determined at all, use null.
- "title": a short human label for this evidence, maximum 6 words.
- "description": what this evidence shows, in plain English, maximum 30 words.
"""


def _strip_fence(text: str) -> str:
    text = (text or "").strip()
    if text.startswith("```"):
        text = text.strip("`")
        # ```json / ```markdown ... — drop a bare language tag on the first
        # line (but never real content, which always has more on that line).
        first, _, rest = text.partition("\n")
        if rest and re.fullmatch(r"[A-Za-z0-9_-]+", first.strip()):
            text = rest
    return text.strip()


def _message_text(message) -> str:
    """Pull plain text out of a chat completion message.

    Weak/routed free models answer in several shapes: plain string content,
    a list of content parts, or (reasoning models) an empty content with the
    answer buried in the reasoning field.
    """
    content = getattr(message, "content", None)
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict):
                parts.append(part.get("text") or "")
        content = "\n".join(part for part in parts if part)
    if not content:
        content = getattr(message, "reasoning", None) or ""
    return _strip_fence(content)


def _loads_relaxed(snippet: str):
    """Try progressively more forgiving ways to parse an object.

    strict=False allows literal newlines/tabs inside string values, which
    weaker free models emit constantly; the trailing-comma pass and
    ast.literal_eval cover python-style output.
    """
    attempts = (
        lambda s: json.loads(s),
        lambda s: json.loads(s, strict=False),
        lambda s: ast.literal_eval(s),
        lambda s: json.loads(re.sub(r",\s*([}\]])", r"\1", s), strict=False),
        lambda s: ast.literal_eval(re.sub(r",\s*([}\]])", r"\1", s)),
    )
    for load in attempts:
        try:
            data = load(snippet)
        except (ValueError, SyntaxError):
            continue
        if isinstance(data, dict):
            return data
    return {}


def _parse_model_json(text: str) -> dict:
    """Best-effort extraction of a JSON object from a model response."""
    text = _strip_fence(text)
    # Free models love curly/smart quotes, which break strict JSON parsing.
    text = (
        text.replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2018", "'")
        .replace("\u2019", "'")
    )
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        return {}
    return _loads_relaxed(text[start : end + 1])


def _unquote(value: str) -> str:
    """Undo simple JSON escapes in a regex-salvaged string."""
    return re.sub(
        r"\\(.)",
        lambda m: {"n": "\n", "t": "\t", "r": "\n"}.get(m.group(1), m.group(1)),
        value,
    )


def _clean_salvaged(value: str) -> str:
    """Trim structural junk a salvage match can swallow.

    Happens when the model emitted unescaped quotes inside a value: the
    match then runs to the end of the output and can pick up the rest of
    the object (closing quotes, braces, the next `"key":` pair).
    """
    m = re.search(r'"\s*,\s*"(?:title|date|name|label|summary|description|desc)"\s*:', value, re.I)
    if m:
        value = value[: m.start()]
    return re.sub(r'["\s}]+$', "", value).rstrip()


def _salvage_string(text: str, key: str, limit: int) -> str:
    """Pull one quoted value out of almost-JSON output, in two passes.

    1. Proper-ish value: escaped quotes are skipped (\\."), and the closing
       quote must be followed by the next key / end of object, so unescaped
       quotes *inside* the value don't cut it short.
    2. Output truncated mid-value (max_tokens cut it off): take the tail.
    """
    m = re.search(
        rf'"{key}"\s*:\s*"((?:\\.|[^"\\]){{1,{limit}}}?)"\s*(?=[,}}\n]|$)',
        text,
        re.I | re.S,
    )
    if m:
        return _unquote(m.group(1))
    m = re.search(rf'"{key}"\s*:\s*"(.{{1,{limit}}})$', text, re.I | re.S)
    if m:
        return _clean_salvaged(_unquote(m.group(1)))
    return ""


def _salvage_fields(text: str) -> dict:
    """Last resort: regex the fields out of almost-JSON output.

    Runs when JSON parsing fails entirely, which happens with weaker free
    models (unescaped quotes or raw newlines inside strings are enough to
    break it).
    """
    text = text or ""
    salvaged = {}
    date_match = re.search(r'"date"\s*:\s*"?(\d{4}-\d{2}-\d{2})', text, re.I)
    if date_match:
        salvaged["date"] = date_match.group(1)
    title = _salvage_string(text, "title", 120) or _salvage_string(text, "name", 120) or _salvage_string(text, "label", 120)
    if title:
        salvaged["title"] = title
    description = (
        _salvage_string(text, "description", 600)
        or _salvage_string(text, "summary", 600)
        or _salvage_string(text, "desc", 600)
    )
    if description:
        salvaged["description"] = description
    return salvaged


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
        # The client sends the file's own metadata date as a hint - pass it
        # through to the model instead of ignoring it.
        hint = ""
        if (hint_date or "").strip():
            hint = (
                f" The file's metadata date is {hint_date.strip()}. Prefer a date"
                " found inside the document itself when they differ."
            )

        if content_type.startswith("image/"):
            base64_file = base64.b64encode(contents).decode("utf-8")
            messages = [
                {"role": "system", "content": timeline_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"Extract the date, title and description of this evidence image.{hint}"},
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
                        {"type": "text", "text": f"Extract the date, title and description of this evidence document.{hint}"},
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
            max_tokens=2000,
            messages=messages,
            extra_body=extra_body,
        )
        raw = _message_text(response.choices[0].message)
        logger.info("timeline: raw model output for %s: %r", filename, (raw or "")[:500])
        data = _parse_model_json(raw)
        if not (data.get("date") or data.get("title") or data.get("description")):
            data = _salvage_fields(raw)
            if data:
                logger.warning("timeline: JSON parse failed, salvaged fields via regex for %s", filename)
        if not data:
            logger.warning("timeline: could not extract anything from model output for %s", filename)
        title = (data.get("title") or data.get("name") or data.get("label") or "").strip()
        description = (data.get("description") or data.get("summary") or data.get("desc") or "").strip()
        return {
            "supported": supported,
            "date": _normalise_date(data.get("date")),
            "title": title,
            "description": description,
        }
    except Exception as e:
        logger.exception("timeline_analyze failed for %s", locals().get("filename", "?"))
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )