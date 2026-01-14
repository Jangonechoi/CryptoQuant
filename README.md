# CryptoQuant - AI 기반 암호화폐 차트 & 자동매매 데모 플랫폼

암호화폐 시세 데이터를 시각적으로 제공하고, 자동매매 전략을 설정하여 모의 백테스트를 수행할 수 있는 웹 기반 데모 플랫폼입니다.

## 기술 스택

### Frontend
- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **React Query** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **TradingView Lightweight Charts** - 차트 시각화

### Backend
- **FastAPI** - Python 웹 프레임워크
- **Binance API** - 암호화폐 시세 데이터

## 시작하기

### 프론트엔드 실행

1. 의존성 설치
```bash
cd cryptoquant-project
npm install
```

2. 환경 변수 설정
```bash
cp .env.local.example .env.local
# .env.local 파일을 열어서 API URL을 설정하세요
```

3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 백엔드 실행

1. 가상환경 생성 및 활성화
```bash
cd cryptoquant-backend
python3 -m venv venv
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

API 문서는 [http://localhost:8000/docs](http://localhost:8000/docs)에서 확인할 수 있습니다.

## 주요 기능

- ✅ 실시간 암호화폐 시세 조회 (Binance API 연동)
- ✅ 인터랙티브 캔들스틱 차트
- ✅ 자동매매 전략 백테스트
- ✅ 다크 모드 UI 
- ✅ 반응형 디자인

## 프로젝트 구조

```
cryptoquant-project/
├── src/
│   ├── app/              # Next.js App Router 페이지
│   ├── components/       # React 컴포넌트
│   ├── lib/              # 유틸리티 및 API 클라이언트
│   ├── store/            # Zustand 스토어
│   └── providers/        # React Context Providers

cryptoquant-backend/
├── app/
│   ├── api/              # API 라우터
│   └── services/         # 비즈니스 로직
└── main.py               # FastAPI 앱 진입점
```

## 다음 단계

- [ ] 소셜 로그인 구현 (Google/GitHub)
- [ ] PortOne 결제 시스템 통합
- [ ] 실제 백테스트 알고리즘 구현
- [ ] 사용자 대시보드 및 이력 관리
- [ ] 데이터베이스 연동 (SQLite/PostgreSQL)

## 주의사항

⚠️ 본 서비스는 실제 거래를 실행하지 않으며, 모든 자동매매 기능은 학습 및 시뮬레이션 목적으로만 제공됩니다.

## 라이선스

MIT
