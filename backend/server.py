from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection dengan fallback agar tidak crash jika env belum terpasang
mongo_url = os.getenv('MONGO_URL')
db_name = os.getenv('DB_NAME')

if not mongo_url or not db_name:
    logging.warning("MONGO_URL atau DB_NAME belum diatur di Environment Variables!")

client = AsyncIOMotorClient(mongo_url) if mongo_url else None
db = client[db_name] if client and db_name else None

AUTH_USERNAME = os.getenv('AYA_USERNAME', 'aya')
AUTH_CODE     = os.getenv('AYA_CODE', '1510')

app = FastAPI()

# CORS middleware
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint utama di root (/) khusus untuk Railway Health Check
@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Server Railway aktif"}

# Router dengan prefix /api
api_router = APIRouter(prefix="/api")

class LoginRequest(BaseModel):
    username: str
    code: str

class LoginResponse(BaseModel):
    success: bool
    message: str

@api_router.get("/")
async def api_root():
    return {"message": "API Server berjalan"}

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    username_input = (payload.username or "").strip()
    code_input     = (payload.code or "").strip()

    if username_input.lower() == AUTH_USERNAME.lower() and code_input == AUTH_CODE:
        return LoginResponse(success=True, message="Login berhasil")
    return LoginResponse(success=False, message="Username atau kode salah")

app.include_router(api_router)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    # Membaca PORT dari Railway, jika tidak ada baru gunakan 8001 (lokal)
    port = int(os.getenv("PORT", 8001))
    # Matikan reload di environment produksi
    is_debug = os.getenv("ENVIRONMENT", "production") == "development"
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=is_debug)