from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os

load_dotenv()

from database import init_db
from routes.auth_routes import router as auth_router
from routes.progress_routes import router as progress_router
from routes.admin_routes import router as admin_router

app = FastAPI(title="Tarteel Type API", version="1.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Origins allowed to call the API. FRONTEND_URL covers the deployment;
# the localhost entries keep local dev working, and the production domains
# are listed explicitly so it works even if FRONTEND_URL is misconfigured.
# Set extra origins via the comma-separated EXTRA_CORS_ORIGINS env var.
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "https://quranlearn.org",
    "https://www.quranlearn.org",
]
allowed_origins += [
    o.strip() for o in os.getenv("EXTRA_CORS_ORIGINS", "").split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(allowed_origins)),  # de-dupe, keep order
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(progress_router)
app.include_router(admin_router)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/admin", include_in_schema=False)
def admin_panel():
    return FileResponse("static/admin.html")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
def startup():
    init_db()
    # Create a default admin user if none exists
    from database import SessionLocal, User
    from auth import hash_password
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.is_admin == True).first():
            admin = User(
                email="admin@tarteel.type",
                name="Admin",
                hashed_password=hash_password("admin123"),
                is_admin=True,
            )
            db.add(admin)
            db.commit()
            print("✓ Default admin created: admin@tarteel.type / admin123")
            print("  ⚠  Change this password immediately in production!")
    finally:
        db.close()
