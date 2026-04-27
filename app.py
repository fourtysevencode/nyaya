from fastapi import FastAPI, Request, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from google import genai
from google.genai import types
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nyaya.ronakbuilds.tech",
        "https://fourtysevencode-nyaya.hf.space"
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="templates/static"), name="static")
app.mount("/favicon", StaticFiles(directory="templates/static/favicon"), name="favicon")

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


@app.get("/", response_class=HTMLResponse) # HTML response, not json
async def home(request: Request):
    return templates.TemplateResponse(request, "index.html")

@app.get("/fir-analysis", response_class=HTMLResponse) # HTML response, not json
async def fir_analysis_page(request: Request):
    return templates.TemplateResponse(request, "fir_summary.html")

@app.get("/section-finder", response_class=HTMLResponse) # HTML response, not json
async def section_finder_page(request: Request):
    return templates.TemplateResponse(request, "section_finder.html")

@app.post("/fir_analysis")
async def analysis(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=prompt,
                max_output_tokens=3000
            ),
            contents=types.Part.from_bytes(
                data=contents,
                mime_type="application/pdf"
            )
        )
        return {"analysis": response.text}
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )