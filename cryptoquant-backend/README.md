# CryptoQuant Backend API

FastAPI 기반 백엔드 서버

## 설치 및 실행

1. 가상환경 활성화

```bash
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate  # Windows
```

2. 의존성 설치

```bash
pip install -r requirements.txt
```

3. PostgreSQL 데이터베이스 설정

   - PostgreSQL이 설치되어 있어야 합니다
   - 데이터베이스 생성:

   ```bash
   # PostgreSQL 접속
   psql -U postgres

   # 데이터베이스 생성
   CREATE DATABASE cryptoquant;
   \q
   ```

4. 환경 변수 설정

   - `env.example` 파일을 참고하여 `.env` 파일 생성

   ```bash
   cp env.example .env
   ```

   - `.env` 파일에서 `DATABASE_URL` 수정:

   ```
   DATABASE_URL=postgresql://사용자명:비밀번호@localhost:5432/cryptoquant
   ```

5. 데이터베이스 마이그레이션 실행

   ```bash
   # 초기 마이그레이션 생성
   alembic revision --autogenerate -m "Initial migration"

   # 마이그레이션 적용
   alembic upgrade head
   ```

6. 서버 실행

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API 엔드포인트

- `GET /` - API 정보
- `GET /health` - 헬스 체크
- `GET /api/market/price` - 시세 조회
- `GET /api/market/coins` - 코인 목록
- `POST /api/strategy/backtest` - 백테스트 실행
- `POST /api/auth/login` - 로그인

## 환경 변수

`.env` 파일을 생성하여 다음 변수들을 설정하세요:

```
# 데이터베이스 설정 (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cryptoquant

# JWT 설정
JWT_SECRET_KEY=your-secret-key-change-in-production

# Google OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id

# 기타 API 키들 (선택사항)
# BINANCE_API_KEY=your-binance-api-key
# BINANCE_SECRET_KEY=your-binance-secret-key
# COINGECKO_API_KEY=your-coingecko-api-key
# GEMINI_API_KEY=your-gemini-api-key
```

## 데이터베이스 모델

현재 다음 모델들이 정의되어 있습니다:

- **User**: 사용자 정보
- **Strategy**: 전략 정보
- **BacktestResult**: 백테스트 결과

## Alembic 마이그레이션

데이터베이스 스키마 변경 시:

```bash
# 변경사항 자동 감지하여 마이그레이션 파일 생성
alembic revision --autogenerate -m "설명"

# 마이그레이션 적용
alembic upgrade head

# 마이그레이션 롤백
alembic downgrade -1
```
