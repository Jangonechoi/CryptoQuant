"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

// 아이콘 컴포넌트들
const SearchIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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

const TrendingDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
    />
  </svg>
);

interface StrategyHistory {
  id: number;
  name: string;
  symbol: string;
  strategy: string;
  date: string;
  totalReturn: number;
  totalTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  status: "완료" | "실행중" | "실패";
}

export default function StrategyHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "완료" | "실행중" | "실패"
  >("all");

  // Mock 데이터
  const mockHistories: StrategyHistory[] = [
    {
      id: 1,
      name: "BTC/USDT 이동평균 전략",
      symbol: "BTCUSDT",
      strategy: "이동평균 교차",
      date: "2024-01-15 14:30",
      totalReturn: 12.5,
      totalTrades: 45,
      winRate: 62.2,
      maxDrawdown: -5.3,
      sharpeRatio: 1.85,
      status: "완료",
    },
    {
      id: 2,
      name: "ETH/USDT RSI 전략",
      symbol: "ETHUSDT",
      strategy: "RSI 과매수/과매도",
      date: "2024-01-14 10:15",
      totalReturn: -3.2,
      totalTrades: 28,
      winRate: 42.9,
      maxDrawdown: -8.7,
      sharpeRatio: -0.45,
      status: "완료",
    },
    {
      id: 3,
      name: "SOL/USDT 볼린저 밴드 전략",
      symbol: "SOLUSDT",
      strategy: "볼린저 밴드 돌파",
      date: "2024-01-13 16:45",
      totalReturn: 5.8,
      totalTrades: 32,
      winRate: 56.3,
      maxDrawdown: -4.2,
      sharpeRatio: 0.92,
      status: "완료",
    },
    {
      id: 4,
      name: "BNB/USDT MACD 전략",
      symbol: "BNBUSDT",
      strategy: "MACD 교차",
      date: "2024-01-12 09:20",
      totalReturn: 18.3,
      totalTrades: 52,
      winRate: 65.4,
      maxDrawdown: -6.1,
      sharpeRatio: 2.15,
      status: "완료",
    },
    {
      id: 5,
      name: "XRP/USDT 스토캐스틱 전략",
      symbol: "XRPUSDT",
      strategy: "스토캐스틱 오실레이터",
      date: "2024-01-11 13:10",
      totalReturn: 8.7,
      totalTrades: 38,
      winRate: 60.5,
      maxDrawdown: -3.8,
      sharpeRatio: 1.42,
      status: "완료",
    },
    {
      id: 6,
      name: "ADA/USDT 이동평균 전략",
      symbol: "ADAUSDT",
      strategy: "이동평균 교차",
      date: "2024-01-10 11:30",
      totalReturn: -1.5,
      totalTrades: 25,
      winRate: 48.0,
      maxDrawdown: -7.2,
      sharpeRatio: -0.25,
      status: "완료",
    },
    {
      id: 7,
      name: "DOGE/USDT 모멘텀 전략",
      symbol: "DOGEUSDT",
      strategy: "모멘텀 추세 추종",
      date: "2024-01-09 15:00",
      totalReturn: 22.1,
      totalTrades: 67,
      winRate: 68.7,
      maxDrawdown: -4.5,
      sharpeRatio: 2.58,
      status: "완료",
    },
    {
      id: 8,
      name: "LINK/USDT RSI 전략",
      symbol: "LINKUSDT",
      strategy: "RSI 과매수/과매도",
      date: "2024-01-08 12:45",
      totalReturn: 6.4,
      totalTrades: 41,
      winRate: 58.5,
      maxDrawdown: -5.1,
      sharpeRatio: 1.18,
      status: "실행중",
    },
  ];

  // 필터링 및 검색
  const filteredHistories = mockHistories.filter((history) => {
    const matchesSearch =
      history.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.strategy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || history.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-100">전략 실행 이력</h1>
        <Link href="/strategy/backtest">
          <Button variant="primary">새 전략 실행</Button>
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="전략명, 심볼, 전략 타입으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === "all"
                  ? "bg-primary-500 text-neutral-900"
                  : "bg-neutral-700 text-neutral-100 hover:bg-neutral-600"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus("완료")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === "완료"
                  ? "bg-success text-white"
                  : "bg-neutral-700 text-neutral-100 hover:bg-neutral-600"
              }`}
            >
              완료
            </button>
            <button
              onClick={() => setFilterStatus("실행중")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === "실행중"
                  ? "bg-warning text-white"
                  : "bg-neutral-700 text-neutral-100 hover:bg-neutral-600"
              }`}
            >
              실행중
            </button>
            <button
              onClick={() => setFilterStatus("실패")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === "실패"
                  ? "bg-danger text-white"
                  : "bg-neutral-700 text-neutral-100 hover:bg-neutral-600"
              }`}
            >
              실패
            </button>
          </div>
        </div>
      </Card>

      {/* 결과 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-neutral-400 mb-1">총 실행 횟수</p>
          <p className="text-2xl font-bold text-neutral-100">
            {mockHistories.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">완료된 전략</p>
          <p className="text-2xl font-bold text-success">
            {mockHistories.filter((h) => h.status === "완료").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">평균 수익률</p>
          <p className="text-2xl font-bold text-neutral-100">
            {(
              mockHistories
                .filter((h) => h.status === "완료")
                .reduce((sum, h) => sum + h.totalReturn, 0) /
              mockHistories.filter((h) => h.status === "완료").length
            ).toFixed(2)}
            %
          </p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-400 mb-1">평균 승률</p>
          <p className="text-2xl font-bold text-neutral-100">
            {(
              mockHistories
                .filter((h) => h.status === "완료")
                .reduce((sum, h) => sum + h.winRate, 0) /
              mockHistories.filter((h) => h.status === "완료").length
            ).toFixed(1)}
            %
          </p>
        </Card>
      </div>

      {/* 전략 목록 */}
      <div className="space-y-4">
        {filteredHistories.length === 0 ? (
          <Card>
            <p className="text-center text-neutral-400 py-8">
              검색 결과가 없습니다.
            </p>
          </Card>
        ) : (
          filteredHistories.map((history) => (
            <Card
              key={history.id}
              className="hover:bg-neutral-700/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* 왼쪽: 기본 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-neutral-100 truncate">
                      {history.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        history.status === "완료"
                          ? "bg-success/20 text-success"
                          : history.status === "실행중"
                          ? "bg-warning/20 text-warning"
                          : "bg-danger/20 text-danger"
                      }`}
                    >
                      {history.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                    <span>전략: {history.strategy}</span>
                    <span>•</span>
                    <span>{history.date}</span>
                  </div>
                </div>

                {/* 오른쪽: 통계 정보 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">수익률</p>
                    <div className="flex items-center gap-1">
                      {history.totalReturn >= 0 ? (
                        <TrendingUpIcon className="text-success" />
                      ) : (
                        <TrendingDownIcon className="text-danger" />
                      )}
                      <p
                        className={`text-sm font-bold ${
                          history.totalReturn >= 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {history.totalReturn >= 0 ? "+" : ""}
                        {history.totalReturn.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">거래 횟수</p>
                    <p className="text-sm font-bold text-neutral-100">
                      {history.totalTrades}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">승률</p>
                    <p className="text-sm font-bold text-neutral-100">
                      {history.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">최대 낙폭</p>
                    <p className="text-sm font-bold text-danger">
                      {history.maxDrawdown.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">샤프 지수</p>
                    <p className="text-sm font-bold text-neutral-100">
                      {history.sharpeRatio.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 lg:ml-4">
                  <Link href={`/strategy/history/${history.id}`}>
                    <Button variant="secondary" className="text-sm">
                      상세보기
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 페이지네이션 (추후 구현) */}
      {filteredHistories.length > 0 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" disabled>
            이전
          </Button>
          <Button variant="primary">1</Button>
          <Button variant="secondary" disabled>
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
