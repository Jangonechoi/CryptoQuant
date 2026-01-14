from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import market, strategy, auth, chat
from app.database import engine, init_db

app = FastAPI(
    title="CryptoQuant API",
    description="AI 기반 암호화폐 차트 & 자동매매 데모 플랫폼 API",
    version="1.0.0",
)

# 애플리케이션 시작 시 데이터베이스 테이블 생성 (개발용)
# 프로덕션에서는 Alembic 마이그레이션 사용 권장
@app.on_event("startup")
async def startup_event():
    # 데이터베이스 연결 확인
    try:
        # 테이블이 없으면 생성 (개발 환경용)
        # 프로덕션에서는 Alembic 마이그레이션 사용
        init_db()
        print("✅ 데이터베이스 연결 성공")
    except Exception as e:
        print(f"⚠️ 데이터베이스 연결 실패: {e}")
        print("💡 PostgreSQL이 실행 중인지 확인하고 DATABASE_URL을 확인하세요.")

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
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/")
async def root():
    return {"message": "CryptoQuant API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

