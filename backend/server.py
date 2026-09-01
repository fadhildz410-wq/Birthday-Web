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

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ✅ Nama variable disesuaikan — pastikan .env dan Railway pakai nama yang sama
AUTH_USERNAME = os.environ.get('AYA_USERNAME', 'aya')
AUTH_CODE     = os.environ.get('AYA_CODE', '1510')

app = FastAPI()

# ✅ CORS middleware HARUS didaftarkan sebelum router di-include
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router dengan prefix /api
api_router = APIRouter(prefix="/api")

class LoginRequest(BaseModel):
    username: str
    code: str

class LoginResponse(BaseModel):
    success: bool
    message: str

@api_router.get("/")
async def root():
    return {"message": "Server berjalan"}

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    username_input = (payload.username or "").strip()
    code_input     = (payload.code or "").strip()

    if username_input.lower() == AUTH_USERNAME.lower() and code_input == AUTH_CODE:
        return LoginResponse(success=True, message="Login berhasil")
    return LoginResponse(success=False, message="Username atau kode salah")

# ✅ Router di-include SETELAH middleware
app.include_router(api_router)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)