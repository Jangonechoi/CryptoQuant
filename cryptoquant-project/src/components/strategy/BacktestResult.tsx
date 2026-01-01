"use client";

import Card from "@/components/ui/Card";
import TradingChart from "@/components/market/TradingChart";

interface BacktestResultProps {
  result?: {
    totalReturn: number;
    totalTrades: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
    chartData?: Array<{
      time: number;
      open: number;
      high: number;
      low: number;
      close: number;
    }>;
    equityCurve?: Array<{
      time: number;
      value: number;
    }>;
  };
  isLoading?: boolean;
}

export default function BacktestResult({
  result,
  isLoading = false,
}: BacktestResultProps) {
  if (isLoading) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-neutral-100 mb-6">백테스트 결과</h2>
        <div className="space-y-4">
          <div className="h-8 bg-neutral-700 rounded animate-pulse" />
          <div className="h-8 bg-neutral-700 rounded animate-pulse" />
          <div className="h-8 bg-neutral-700 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-neutral-100 mb-6">백테스트 결과</h2>
        <p className="text-neutral-400 text-center py-8">
          백테스트를 실행하면 결과가 여기에 표시됩니다.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 결과 요약 */}
      <Card>
        <h2 className="text-2xl font-bold text-neutral-100 mb-6">백테스트 결과</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-neutral-400 mb-1">누적 수익률</p>
            <p
              className={`text-2xl font-bold ${
                result.totalReturn >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {result.totalReturn >= 0 ? "+" : ""}
              {result.totalReturn.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-400 mb-1">총 거래 횟수</p>
            <p className="text-2xl font-bold text-neutral-100">
              {result.totalTrades}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-400 mb-1">승률</p>
            <p className="text-2xl font-bold text-neutral-100">
              {result.winRate.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-400 mb-1">최대 낙폭 (MDD)</p>
            <p className="text-2xl font-bold text-danger">
              {result.maxDrawdown.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-400 mb-1">샤프 지수</p>
            <p className="text-2xl font-bold text-neutral-100">
              {result.sharpeRatio.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* 결과 차트 */}
      {result.chartData && (
        <TradingChart data={result.chartData} isLoading={false} />
      )}

      {/* 안내 문구 */}
      <Card className="bg-neutral-800 border border-warning/20">
        <p className="text-sm text-neutral-400">
          ⚠️ 본 결과는 과거 데이터 기반 시뮬레이션입니다. 실제 투자 결과와 다를 수 있습니다.
        </p>
      </Card>
    </div>
  );
}

