"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

// 간단한 아이콘 컴포넌트들
const UserIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CreditCardIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

export default function DashboardPage() {
  // 임시 데이터 (나중에 실제 데이터로 교체)
  const userStats = {
    totalStrategies: 12,
    totalBacktests: 45,
    averageReturn: 8.5,
    totalProfit: 1250000,
  };

  const subscription = {
    plan: "Standard",
    status: "활성",
    expiresAt: "2024-12-31",
  };

  const recentStrategies = [
    {
      id: 1,
      name: "BTC/USDT 이동평균 전략",
      date: "2024-01-15",
      return: 12.5,
      status: "완료",
    },
    {
      id: 2,
      name: "ETH/USDT RSI 전략",
      date: "2024-01-14",
      return: -3.2,
      status: "완료",
    },
    {
      id: 3,
      name: "SOL/USDT 볼린저 밴드 전략",
      date: "2024-01-13",
      return: 5.8,
      status: "완료",
    },
  ];

  const recentPayments = [
    {
      id: 1,
      plan: "Standard",
      amount: 49000,
      date: "2024-01-01",
      status: "완료",
    },
    {
      id: 2,
      plan: "Standard",
      amount: 49000,
      date: "2023-12-01",
      status: "완료",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-100">대시보드</h1>
        <Link href="/strategy/backtest">
          <Button variant="primary">새 전략 실행</Button>
        </Link>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">총 전략 수</p>
              <p className="text-2xl font-bold text-neutral-100">
                {userStats.totalStrategies}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <TrendingUpIcon />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">총 백테스트</p>
              <p className="text-2xl font-bold text-neutral-100">
                {userStats.totalBacktests}
              </p>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center text-info">
              <ClockIcon />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">평균 수익률</p>
              <p className="text-2xl font-bold text-success">
                +{userStats.averageReturn}%
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center text-success">
              <TrendingUpIcon />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">총 수익</p>
              <p className="text-2xl font-bold text-neutral-100">
                ₩{userStats.totalProfit.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center text-warning">
              <CreditCardIcon />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 사용자 프로필 카드 */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center">
              <UserIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-100">사용자</h2>
              <p className="text-sm text-neutral-400">user@example.com</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">가입일</span>
              <span className="text-neutral-100">2024-01-01</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">마지막 로그인</span>
              <span className="text-neutral-100">2024-01-15</span>
            </div>
          </div>
          <Link href="/mypage/profile">
            <Button variant="secondary" className="w-full mt-4">
              프로필 수정
            </Button>
          </Link>
        </Card>

        {/* 구독 상태 카드 */}
        <Card>
          <h2 className="text-xl font-bold text-neutral-100 mb-4">구독 상태</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-400 mb-1">현재 플랜</p>
              <p className="text-2xl font-bold text-primary-500">
                {subscription.plan}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">상태</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-success/20 text-success">
                {subscription.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-neutral-400 mb-1">만료일</p>
              <p className="text-neutral-100">{subscription.expiresAt}</p>
            </div>
          </div>
          <Link href="/mypage/subscription">
            <Button variant="primary" className="w-full mt-4">
              플랜 변경
            </Button>
          </Link>
        </Card>

        {/* 빠른 액션 카드 */}
        <Card>
          <h2 className="text-xl font-bold text-neutral-100 mb-4">빠른 액션</h2>
          <div className="space-y-3">
            <Link href="/strategy/backtest" className="block">
              <Button variant="primary" className="w-full">
                백테스트 실행
              </Button>
            </Link>
            <Link href="/strategy/history" className="block">
              <Button variant="secondary" className="w-full">
                전략 히스토리
              </Button>
            </Link>
            <Link href="/markets" className="block">
              <Button variant="secondary" className="w-full">
                시장 조회
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 전략 히스토리 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-100">
              최근 전략 실행
            </h2>
            <Link
              href="/strategy/history"
              className="text-sm text-primary-500 hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <div className="space-y-3">
            {recentStrategies.map((strategy) => (
              <div
                key={strategy.id}
                className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-100 truncate">
                    {strategy.name}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {strategy.date}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p
                    className={`text-sm font-bold ${
                      strategy.return >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {strategy.return >= 0 ? "+" : ""}
                    {strategy.return}%
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {strategy.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 최근 결제 히스토리 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-100">결제 내역</h2>
            <Link
              href="/mypage/history"
              className="text-sm text-primary-500 hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-100">
                    {payment.plan} 플랜
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {payment.date}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-neutral-100">
                    ₩{payment.amount.toLocaleString()}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-success/20 text-success mt-1">
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
