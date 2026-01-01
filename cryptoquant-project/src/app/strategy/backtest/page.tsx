"use client";

import { useState } from "react";
import StrategyForm, { StrategyConfig } from "@/components/strategy/StrategyForm";
import BacktestResult from "@/components/strategy/BacktestResult";
import { useBacktest } from "@/lib/api/queries";

export default function BacktestPage() {
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig | null>(
    null
  );
  const [shouldRun, setShouldRun] = useState(false);

  const { data: backtestResult, isLoading } = useBacktest(
    strategyConfig,
    shouldRun
  );

  const handleSubmit = (config: StrategyConfig) => {
    setStrategyConfig(config);
    setShouldRun(true);
  };

  // 목업 결과 데이터 (실제 API 연동 전)
  const mockResult = strategyConfig && shouldRun && !backtestResult
    ? {
        totalReturn: 15.5,
        totalTrades: 42,
        winRate: 65.5,
        maxDrawdown: -8.2,
        sharpeRatio: 1.8,
        chartData: Array.from({ length: 50 }, (_, i) => ({
          time: Date.now() / 1000 - (50 - i) * 86400,
          open: 95000 + Math.random() * 1000,
          high: 96000 + Math.random() * 1000,
          low: 94000 + Math.random() * 1000,
          close: 95000 + Math.random() * 1000,
        })),
      }
    : backtestResult;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-100 mb-8">백테스트</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 전략 설정 폼 */}
        <div>
          <StrategyForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* 결과 영역 */}
        <div>
          <BacktestResult result={mockResult} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}


