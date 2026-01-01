from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import market, strategy, auth

app = FastAPI(
    title="CryptoQuant API",
    description="AI 기반 암호화폐 차트 & 자동매매 데모 플랫폼 API",
    version="1.0.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(market.router, prefix="/api/market", tags=["market"])
app.include_router(strategy.router, prefix="/api/strategy", tags=["strategy"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])


@app.get("/")
async def root():
    return {"message": "CryptoQuant API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

