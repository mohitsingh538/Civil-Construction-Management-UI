import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load .env from the backend directory (one level above this file's package)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.db.session import create_tables
from app.routers import companies, invoice_ocr

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Civil Construction Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invoice_ocr.router)
app.include_router(companies.router)


@app.on_event("startup")
def on_startup() -> None:
    create_tables()


@app.get("/health")
def health():
    return {"status": "ok"}
