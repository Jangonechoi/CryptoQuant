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

3. 서버 실행
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
DATABASE_URL=sqlite:///./cryptoquant.db
JWT_SECRET_KEY=your-secret-key
BINANCE_API_KEY=your-binance-api-key
BINANCE_API_SECRET=your-binance-api-secret
```

