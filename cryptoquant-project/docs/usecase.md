⸻

📘 Use Case Document

AI 기반 암호화폐 차트 & 자동매매 데모 플랫폼

⸻

1. Actor Definitions

1.1 주요 액터

Actor 설명
비회원 사용자 로그인하지 않은 모든 방문자
일반 회원 (무료) 소셜 로그인을 완료한 사용자
프리미엄 회원 결제를 완료하여 프리미엄 플랜을 이용 중인 사용자
시스템 Backend 서버(FastAPI), 외부 API, 결제 시스템

⸻

2. Comprehensive Actor Definitions

2.1 비회원 사용자
• 서비스 기능을 탐색하는 사용자
• 시세 조회 및 차트 열람만 가능
• 전략 실행 및 개인화 기능 접근 불가

2.2 일반 회원 (무료)
• 소셜 로그인을 통해 인증된 사용자
• 제한된 자동매매(모의) 및 백테스트 가능
• 프리미엄 기능 접근 시 결제 유도

2.3 프리미엄 회원
• PortOne 결제를 완료한 사용자
• 확장된 백테스트 기간 및 전략 파라미터 사용 가능
• 전략 실행 이력 저장 가능

2.4 시스템
• 외부 암호화폐 시세 API 제공
• 사용자 인증 및 토큰 검증
• 결제 검증 및 구독 상태 관리

⸻

3. Use Case Scenarios (요약)

Use Case ID 제목 액터
UC-01 암호화폐 시세 조회 비회원
UC-02 소셜 로그인 비회원
UC-03 자동매매 전략 백테스트 실행 일반 회원
UC-04 프리미엄 결제 일반 회원
UC-05 프리미엄 전략 백테스트 실행 프리미엄 회원
UC-06 마이페이지 조회 로그인 사용자

⸻

4. Detailed Use Case Scenarios

⸻

UC-01. 암호화폐 시세 조회

Actor
• 비회원 사용자

Preconditions
• 인터넷 연결이 가능한 상태
• 서비스 정상 운영 중

Main Steps (Flow of Events) 1. 사용자는 메인 페이지(/)에 접속한다. 2. 시스템은 기본 암호화폐 목록(BTC, ETH 등)을 표시한다. 3. 사용자는 특정 암호화폐를 선택한다. 4. 시스템은 선택한 암호화폐의 가격 차트를 표시한다. 5. 사용자는 기간(1m, 5m, 1h, 1d)을 변경할 수 있다.

Postconditions
• 선택한 암호화폐의 차트를 정상적으로 확인

⸻

5. Main Steps and Flow of Events

UC-02. 소셜 로그인

Actor
• 비회원 사용자

Preconditions
• 소셜 계정(Google/GitHub)을 보유

Main Steps 1. 사용자는 상단 네비게이션에서 “로그인” 버튼 클릭 2. 소셜 로그인 제공자 선택 3. 인증 완료 후 콜백 페이지로 이동 4. 시스템은 사용자 정보를 DB에 저장하거나 기존 정보 조회 5. JWT 토큰 발급 후 로그인 상태 유지

Postconditions
• 사용자는 로그인 상태가 된다.

⸻

6. Alternative Flows and Edge Cases

UC-02-A. 소셜 로그인 실패
• 사용자가 인증을 중단하거나 실패
• 시스템은 오류 메시지를 표시
• 로그인 페이지로 복귀

⸻

7. Preconditions and Postconditions (자동매매/백테스트)

UC-03. 자동매매 전략 백테스트 실행 (무료)

Actor
• 일반 회원

Preconditions
• 로그인 완료
• 무료 플랜 상태

Main Steps 1. 사용자는 전략 페이지(/strategy/backtest) 이동 2. 기본 전략 선택 (이동평균 전략) 3. 제한된 기간 선택 4. “백테스트 실행” 클릭 5. 시스템은 과거 데이터를 조회 6. 전략 로직을 적용해 결과 계산 7. 요약 결과 차트 표시

Postconditions
• 백테스트 결과 화면 노출
• 실행 이력은 저장되지 않음

⸻

UC-03-B. 제한 조건 발생
• 사용자가 허용된 기간 초과 선택
• 시스템은 “프리미엄 기능 안내 모달” 표시

⸻

8. Business Rules and Constraints

8.1 비즈니스 규칙
• 실제 거래는 수행하지 않는다.
• 프리미엄 결제는 기능 접근 권한에 한정된다.
• 자동매매는 모의 시뮬레이션만 제공한다.

8.2 시스템 제약
• 외부 API 요청 제한 처리 필요
• 동시 다중 요청 시 처리 지연 가능

⸻

9. Exception Handling Procedures

상황 처리 방식
외부 API 실패 “데이터를 불러올 수 없습니다” 메시지
토큰 만료 자동 로그아웃 + 재로그인 유도
결제 검증 실패 결제 상태 미반영 및 안내 메시지 표시

⸻

10. User Interface Considerations
    • 모든 중요한 액션에는 로딩 상태 표시
    • 제한된 기능 클릭 시 명확한 안내 제공
    • 색상 대비와 폰트 크기는 접근성 기준 준수

⸻

11. Data Requirements and Data Flow

데이터 흐름 요약 1. 사용자 요청 2. Backend(FastAPI) 수신 3. 외부 암호화폐 API 호출 4. 데이터 가공 5. 프론트엔드로 JSON 응답 6. 차트 렌더링

전략 결과 데이터는 서버에서 계산 후 프론트로 전달

⸻

12. Security and Privacy Considerations
    • JWT 기반 인증
    • 민감 정보(결제 정보)는 서버에서만 처리
    • 프론트엔드에는 최소 정보만 전달
    • HTTPS 통신 필수
    • 실제 거래 API Key 수집 금지

⸻

✅ 문서 요약
• 사용자 유형별 명확한 흐름 정의
• 무료 → 프리미엄 전환 구조
• 안전한 자동매매(모의) 정책 유지
• 실무 기준 예외 처리 포함

⸻
