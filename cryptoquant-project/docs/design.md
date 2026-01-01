
⸻

🎨 UI / UX Design Guide

AI 기반 암호화폐 차트 & 자동매매 데모 플랫폼

⸻

1. Design System Overview

1.1 Reference 분석: Binance

Binance 디자인의 핵심 특성은 다음과 같다.

항목	분석
디자인 성격	데이터 중심, 프로페셔널, 미니멀
UI 패턴	카드 기반 레이아웃 + 강한 대비
컬러 사용	어두운 배경 + 강조색(Yellow)
정보 밀도	높지만 구조적으로 정리됨
UX 포인트	빠른 정보 스캔, 즉각적 피드백

Binance는 “멋있어 보이기”보다
신뢰감 + 전문성 + 속도감을 우선한다.

⸻

1.2 적용할 디자인 방향 (본 프로젝트)

“Binance 느낌이 나되, 초보자도 부담 없는 금융 대시보드”

✅ 전체 스타일 요약
	•	Modern Fintech Dark UI
	•	카드 기반 정보 구조
	•	명확한 색상 계층
	•	차트가 주인공인 화면 구성

✅ 무드 & 분위기
	•	신뢰감
	•	전문적
	•	차분함
	•	데이터 친화적
	•	과장 없는 절제된 강조

⸻

2. Color Palette (Tailwind CSS 기준)

2.1 컬러 설계 원칙
	•	Dark Mode 기본
	•	색은 “강조”로만 사용
	•	수익/손실은 직관적인 색 대비
	•	장식용 컬러 최소화

⸻

2.2 Primary Color (Brand Color)

토큰	색상
primary-50	#FFF9E6
primary-100	#FFF0BF
primary-200	#FFE066
primary-300	#FFD633
primary-400	#F0C000
primary-500	#FCD535 ✅
primary-600	#E6B800
primary-700	#CC9E00
primary-800	#B38600
primary-900	#806000

선정 이유
	•	Binance의 대표 컬러 계보 유지
	•	CTA/강조용으로 사용 시 가시성 최고

⸻

2.3 Neutral (Dark UI Base)

토큰	색상
neutral-50	#F9FAFB
neutral-100	#E5E7EB
neutral-200	#D1D5DB
neutral-300	#9CA3AF
neutral-400	#6B7280
neutral-500	#4B5563
neutral-600	#374151
neutral-700	#1F2937
neutral-800	#111827 ✅
neutral-900	#0B0F1A ✅


⸻

2.4 Semantic Colors

목적	색상
상승 (Profit)	#16C784
하락 (Loss)	#EA3943
정보	#3B82F6
경고	#F59E0B


⸻

3. Page Implementations

⸻

3.1 Home (/) – Market Overview

Core Purpose
	•	서비스 첫 인상
	•	현재 시장 상태 빠른 파악

Key Components
	•	Top Summary Bar
	•	대표 코인 카드
	•	차트 프리뷰

Layout Structure

[ Header ]
[ Market Summary Cards ]
[ Featured Chart ]
[ Footer ]

콘텐츠 텍스트 예시
	•	“실시간 암호화폐 시장 현황”
	•	“BTC / ETH 가격 흐름 한눈에 보기”

이미지 (히어로 배경, 옵션)
	•	https://picsum.photos/1440/400

⸻

3.2 Markets (/markets/:symbol)

Core Purpose
	•	단일 코인 상세 분석

Key Components
	•	Price Header
	•	Candlestick Chart
	•	Indicator Panel

Layout

[ Price Header ]
[ Trading Chart ]
[ Indicator Toggle ]

Grid
	•	Desktop: 12-column
	•	Chart: col-span-9
	•	Indicator: col-span-3

⸻

3.3 Strategy / Backtest (/strategy/backtest)

Core Purpose
	•	전략 실행 & 결과 확인

Key Components
	•	Strategy Form
	•	Run Backtest Button
	•	Result Summary Card
	•	Result Chart

Layout

[ Strategy Setting Panel ] | [ Result Preview ]

주요 문구
	•	“본 결과는 과거 데이터 기반 시뮬레이션입니다.”

이미지 (결과 리포트 썸네일 예시)
	•	https://picsum.photos/800/400

⸻

3.4 Pricing (/pricing)

Core Purpose
	•	요금제 비교 및 결제 유도

Key Components
	•	Plan Card
	•	Feature Comparison
	•	CTA Button

텍스트 예시
	•	“전략 백테스트를 더 깊게”
	•	“학습 및 시뮬레이션 전용 서비스”

⸻

3.5 Dashboard / MyPage

Core Purpose
	•	사용자 상태 요약

Key Components
	•	Profile Card
	•	Subscription Status
	•	History List

Layout

[ User Summary ]
[ Strategy History ]
[ Payment History ]


⸻

4. Layout Components

4.1 Global Header (Topbar)

항목	설명
적용 페이지	전체
구성	로고 / 메뉴 / 유저 메뉴
반응형	모바일 → 햄버거 메뉴


⸻

4.2 Card Component
	•	배경: neutral-800
	•	Radius: rounded-xl
	•	Shadow: 약하게
	•	Padding: p-4 ~ p-6

⸻

5. Interaction Patterns

5.1 기본 원칙
	•	모든 액션은 즉시 피드백
	•	Disabled 상태 명확히 표현
	•	로딩 중 Skeleton UI 사용

5.2 주요 인터랙션

상황	반응
전략 실행	로딩 애니메이션
접근 제한	모달 + 결제 안내
실패	명확한 에러 메시지


⸻

6. Breakpoints

mobile: 320px
tablet: 768px
desktop: 1024px
wide: 1440px

반응형 전략
	•	Mobile
	•	차트 세로 우선
	•	패널은 Accordion
	•	Desktop
	•	Split Layout
	•	Wide
	•	정보 밀도 증가

⸻

✅ 디자인 가이드 요약
	•	✅ Binance 디자인 언어 기반
	•	✅ Dark Fintech UI
	•	✅ 데이터와 차트가 중심
	•	✅ 실제 서비스 수준의 신뢰감

⸻

