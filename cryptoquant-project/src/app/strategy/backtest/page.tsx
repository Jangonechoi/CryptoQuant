"use client";

import { useState, useEffect } from "react";
import StrategyForm, {
  StrategyConfig,
} from "@/components/strategy/StrategyForm";
import BacktestResult from "@/components/strategy/BacktestResult";
import PriceChart from "@/components/strategy/PriceChart";
import CumulativeReturnChart from "@/components/strategy/CumulativeReturnChart";
import MonthlyReturnChart from "@/components/strategy/MonthlyReturnChart";
import { useBacktest } from "@/lib/api/queries";

export default function BacktestPage() {
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig | null>(
    null
  );
  const [shouldRun, setShouldRun] = useState(false);
  const [runId, setRunId] = useState(0); // 실행 ID로 캐시 구분

  const {
    data: backtestResult,
    isLoading,
    error,
  } = useBacktest(
    strategyConfig ? { ...strategyConfig, _runId: runId } : {},
    shouldRun && !!strategyConfig
  );

  const handleSubmit = (config: StrategyConfig) => {
    setStrategyConfig(config);
    setRunId((prev) => prev + 1); // 실행 ID 증가
    setShouldRun(true);
  };

  // 백테스트 실행 후 shouldRun 리셋
  useEffect(() => {
    if (backtestResult && !isLoading) {
      // 약간의 지연 후 리셋하여 차트가 업데이트될 시간 확보
      const timer = setTimeout(() => {
        setShouldRun(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [backtestResult, isLoading]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <h1 className="text-3xl font-bold text-neutral-100 mb-8">백테스트</h1>

      {error && (
        <div className="mb-4 p-4 bg-danger/20 border border-danger/50 rounded-lg">
          <p className="text-danger">
            백테스트 실행 중 오류가 발생했습니다:{" "}
            {error instanceof Error ? error.message : "알 수 없는 오류"}
          </p>
        </div>
      )}

      {/* 2x3 그리드 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* 왼쪽 상단: 전략 설정 */}
        <div className="h-[500px]">
          <StrategyForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* 오른쪽 상단: 백테스트 결과 */}
        <div className="h-[500px]">
          <BacktestResult result={backtestResult} isLoading={isLoading} />
        </div>

        {/* 왼쪽 하단: 백테스트 차트 */}
        <div className="h-[500px]">
          <PriceChart
            key={`price-${runId}`}
            chartData={backtestResult?.chartData}
            tradeSignals={backtestResult?.tradeSignals}
            isLoading={isLoading}
          />
        </div>

        {/* 오른쪽 하단: 누적 수익률 차트 */}
        <div className="h-[500px]">
          <CumulativeReturnChart
            key={`cumulative-${runId}`}
            cumulativeReturnCurve={backtestResult?.cumulativeReturnCurve}
            isLoading={isLoading}
          />
        </div>

        {/* 왼쪽 최하단: 월간 수익률 차트 */}
        <div className="h-[500px]">
          <MonthlyReturnChart
            key={`monthly-${runId}`}
            monthlyReturns={backtestResult?.monthlyReturns}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 안내 문구 - 최하단 */}
      <div className="bg-neutral-800 border border-warning/20 rounded-lg p-4">
        <p className="text-sm text-neutral-400">
          ⚠️ 본 결과는 과거 데이터 기반 시뮬레이션입니다. 실제 투자 결과와 다를
          수 있습니다.
        </p>
      </div>
    </div>
  );
}
