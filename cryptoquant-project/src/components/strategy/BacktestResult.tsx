"use client";

import Card from "@/components/ui/Card";

interface BacktestResultProps {
  result?: {
    initialCapital?: number;
    totalReturn: number;
    totalProfit?: number;
    dailyAverageReturn?: number;
    cumulativeReturn?: number;
    cagr?: number;
    totalTrades: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  isLoading?: boolean;
}

export default function BacktestResult({
  result,
  isLoading = false,
}: BacktestResultProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <h2 className="text-xl font-bold text-neutral-100 mb-4">
          백테스트 결과
        </h2>
        <div className="space-y-3">
          <div className="h-6 bg-neutral-700 rounded animate-pulse" />
          <div className="h-6 bg-neutral-700 rounded animate-pulse" />
          <div className="h-6 bg-neutral-700 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="h-full">
        <h2 className="text-xl font-bold text-neutral-100 mb-4">
          백테스트 결과
        </h2>
        <p className="text-neutral-400 text-center py-6">
          백테스트를 실행하면 결과가 여기에 표시됩니다.
        </p>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="h-full">
      <h2 className="text-xl font-bold text-neutral-100 mb-4">백테스트 결과</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-neutral-400 mb-1">투자원금</p>
          <p className="text-lg font-bold text-neutral-100">
            {result.initialCapital
              ? formatCurrency(result.initialCapital)
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">총 손익</p>
          <p
            className={`text-lg font-bold ${
              (result.totalProfit ?? 0) >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {result.totalProfit !== undefined
              ? `${result.totalProfit >= 0 ? "+" : ""}${formatCurrency(
                  result.totalProfit
                )}`
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">일평균 수익률</p>
          <p
            className={`text-lg font-bold ${
              (result.dailyAverageReturn ?? 0) >= 0
                ? "text-success"
                : "text-danger"
            }`}
          >
            {result.dailyAverageReturn !== undefined
              ? `${
                  result.dailyAverageReturn >= 0 ? "+" : ""
                }${result.dailyAverageReturn.toFixed(2)}%`
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">누적 수익률</p>
          <p
            className={`text-lg font-bold ${
              (result.cumulativeReturn ?? result.totalReturn) >= 0
                ? "text-success"
                : "text-danger"
            }`}
          >
            {(result.cumulativeReturn ?? result.totalReturn) >= 0 ? "+" : ""}
            {(result.cumulativeReturn ?? result.totalReturn).toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">CAGR</p>
          <p
            className={`text-lg font-bold ${
              (result.cagr ?? 0) >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {result.cagr !== undefined
              ? `${result.cagr >= 0 ? "+" : ""}${result.cagr.toFixed(2)}%`
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">총 거래 횟수</p>
          <p className="text-lg font-bold text-neutral-100">
            {result.totalTrades}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">승률</p>
          <p className="text-lg font-bold text-neutral-100">
            {result.winRate.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-1">최대 낙폭 (MDD)</p>
          <p className="text-lg font-bold text-danger">
            {result.maxDrawdown.toFixed(2)}%
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-neutral-400 mb-1">샤프 지수</p>
          <p className="text-lg font-bold text-neutral-100">
            {result.sharpeRatio.toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
}
