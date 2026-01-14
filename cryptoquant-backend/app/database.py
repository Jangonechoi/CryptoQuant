from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# 데이터베이스 URL 구성
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/cryptoquant"
)

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # 연결 유효성 검사
    pool_size=10,  # 연결 풀 크기
    max_overflow=20,  # 추가 연결 허용
    echo=False,  # SQL 쿼리 로깅 (개발 시 True로 설정 가능)
)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 생성 (모델들이 상속받을 클래스)
Base = declarative_base()


def get_db():
    """
    데이터베이스 세션 의존성 함수
    FastAPI의 Depends에서 사용
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    데이터베이스 초기화 함수
    모든 테이블 생성
    """
    Base.metadata.create_all(bind=engine)

