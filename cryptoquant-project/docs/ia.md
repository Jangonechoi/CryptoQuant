
⸻

🧭 Information Architecture (IA)

AI 기반 암호화폐 차트 & 자동매매 데모 플랫폼

⸻

1. Site Map

/
├─ /markets
│   └─ /markets/:symbol
├─ /strategy
│   ├─ /strategy/backtest
│   └─ /strategy/history
├─ /pricing
├─ /dashboard
├─ /mypage
│   ├─ /mypage/profile
│   ├─ /mypage/subscription
│   └─ /mypage/history
├─ /login
└─ /callback/oauth

접근 권한 기준
	•	🔓 비회원 접근 가능
	•	메인, 시세 조회, 차트
	•	🔐 로그인 필요
	•	전략 실행, 백테스트 결과, 마이페이지
	•	💎 구독 필요
	•	고급 백테스트, 전략 파라미터 확장

⸻

2. User Flow

2.1 비회원 사용자 흐름
	1.	메인 페이지 진입
	2.	암호화폐 시세 및 차트 확인
	3.	전략/프리미엄 기능 클릭
	4.	로그인 유도 (소셜 로그인)

⸻

2.2 로그인 사용자 (무료)
	1.	로그인 성공
	2.	전략 페이지 접근
	3.	제한된 백테스트 실행
	4.	프리미엄 기능 클릭
	5.	결제 페이지 이동

⸻

2.3 프리미엄 사용자
	1.	로그인
	2.	전략 설정
	3.	백테스트 실행
	4.	결과 차트 및 리포트 확인
	5.	마이페이지에서 사용 이력 관리

⸻

3. Navigation Structure

3.1 네비게이션 타입
	•	Topbar Navigation
	•	모든 페이지 공통 상단 고정
	•	모바일에서는 햄버거 메뉴로 변환

3.2 Topbar 구성 요소

위치	항목
좌측	로고 (홈 이동)
중앙	시장(Markets), 전략(Strategy), 요금제(Pricing)
우측	로그인/로그아웃, 대시보드


⸻

4. Page Hierarchy

4.1 1 Depth (Global)
	•	홈
	•	시장
	•	전략
	•	요금제
	•	대시보드
	•	마이페이지

4.2 2 Depth

1 Depth	2 Depth
시장	코인 상세
전략	백테스트 / 실행 이력
마이페이지	프로필 / 구독 / 결제


⸻

5. Content Organization

5.1 메인 / 시장 페이지

정보 우선순위
	1.	현재 가격
	2.	가격 차트
	3.	보조 지표
	4.	거래량

구성
	•	코인 선택 드롭다운
	•	차트 영역(메인 콘텐츠)
	•	지표 토글 패널

⸻

5.2 전략 페이지

정보 우선순위
	1.	전략 설정
	2.	실행 버튼
	3.	결과 시각화

구성
	•	전략 파라미터 패널 (좌측)
	•	결과 차트 및 성과 요약 (우측)

⸻

5.3 마이페이지

구성 섹션
	•	내 정보
	•	구독 상태
	•	전략/백테스트 이력
	•	결제 내역

⸻

6. Interaction Patterns

6.1 주요 인터랙션

인터랙션	설명
코인 선택	변경 즉시 차트 갱신
기간 변경	부드러운 차트 리렌더
전략 실행	로딩 상태 → 결과 표시
제한 접근	안내 모달 + 결제 유도


⸻

6.2 UX 고려사항
	•	모든 액션에 로딩 피드백 제공
	•	실패 시 명확한 에러 메시지
	•	주요 버튼은 키보드 접근 가능

⸻

7. URL Structure (SEO & UX)

7.1 URL 설계 원칙
	•	의미 있는 영문 경로
	•	불필요한 쿼리 최소화
	•	리소스 기반 설계

7.2 URL 예시

페이지	URL
메인	/
코인 상세	/markets/btcusdt
전략 실행	/strategy/backtest
요금제	/pricing
마이페이지	/mypage/profile


⸻

8. Component Hierarchy

8.1 글로벌 컴포넌트
	•	AppLayout
	•	Topbar
	•	Footer
	•	GlobalModal
	•	Toast

⸻

8.2 시장 페이지 컴포넌트

MarketPage
├─ CoinSelector
├─ PriceHeader
├─ ChartContainer
│   └─ TradingChart
└─ IndicatorPanel


⸻

8.3 전략 페이지 컴포넌트

StrategyPage
├─ StrategyForm
├─ RunButton
└─ BacktestResult
    ├─ ResultSummary
    └─ ResultChart


⸻

📱 반응형 & 접근성 고려
	•	모바일:
	•	차트는 세로 스크롤 우선
	•	사이드 패널은 하단 시트 형태
	•	색 대비 및 폰트 크기 WCAG 기준 준수
	•	터치 인터페이스 최소 버튼 크기 고려

⸻

🔍 SEO 고려 사항
	•	시세 페이지 정적 메타정보 설정
	•	<title> 및 <meta description> 페이지별 관리
	•	의미 있는 URL 슬러그 사용
	•	불필요한 로그인 강제 제거 (차트는 공개)

⸻

✅ IA 요약
	•	Topbar 중심 단순한 구조
	•	비회원 → 로그인 → 구독으로 자연스러운 전환
	•	차트 중심 콘텐츠 배치
	•	실제 SaaS 서비스와 유사한 흐름

⸻
