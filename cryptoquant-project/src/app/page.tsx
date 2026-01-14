"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import PopularCoins from "@/components/home/PopularCoins";
import PriceHeader from "@/components/market/PriceHeader";
import TradingChart from "@/components/market/TradingChart";
import IntervalSelector from "@/components/market/IntervalSelector";
import PeriodSelector from "@/components/market/PeriodSelector";
import { useMarketPrice, useKlines, fetchKlines } from "@/lib/api/queries";
import { calculateLimitByPeriod } from "@/lib/utils/periodLimit";

export default function Home() {
  const [selectedInterval, setSelectedInterval] = useState("1d");
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const symbol = "BTCUSDT";
  const [allChartData, setAllChartData] = useState<
    Array<{
      time: number;
      open: number;
      high: number;
      low: number;
      close: number;
    }>
  >([]);

  // 기간에 따른 limit 계산
  const limit = useMemo(
    () => calculateLimitByPeriod(selectedPeriod, selectedInterval),
    [selectedPeriod, selectedInterval]
  );

  const { data: marketData, isLoading: isPriceLoading } = useMarketPrice(
    symbol,
    selectedInterval
  );
  const { data: klinesData, isLoading: isKlinesLoading } = useKlines(
    symbol,
    selectedInterval,
    limit
  );

  // 캔들스틱 데이터 변환
  interface KlineData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }

  // 초기 데이터가 로드되면 allChartData에 설정
  useEffect(() => {
    if (klinesData?.data && klinesData.data.length > 0) {
      const newData = klinesData.data.map((kline: KlineData) => ({
        time: kline.time,
        open: kline.open,
        high: kline.high,
        low: kline.low,
        close: kline.close,
      }));

      // 시간순으로 정렬하고 중복 제거
      setAllChartData((prev) => {
        const merged = [...prev, ...newData];
        const unique = merged.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.time === item.time)
        );
        unique.sort((a, b) => a.time - b.time);
        return unique;
      });
    }
  }, [klinesData?.data]);

  // interval이나 period가 변경되면 데이터 초기화
  useEffect(() => {
    setAllChartData([]);
  }, [selectedInterval, selectedPeriod]);

  // 이전 데이터 로드 함수
  const handleLoadMoreData = useCallback(
    async (startTime: number) => {
      try {
        const response = await fetchKlines(
          symbol,
          selectedInterval,
          100,
          startTime
        );
        if (response?.data && response.data.length > 0) {
          const newData = response.data.map((kline: KlineData) => ({
            time: kline.time,
            open: kline.open,
            high: kline.high,
            low: kline.low,
            close: kline.close,
          }));

          // 기존 데이터와 병합 (중복 제거 및 정렬)
          setAllChartData((prev) => {
            const merged = [...prev, ...newData];
            const unique = merged.filter(
              (item, index, self) =>
                index === self.findIndex((t) => t.time === item.time)
            );
            unique.sort((a, b) => a.time - b.time);
            return unique;
          });
        }
      } catch (error) {
        console.error("Failed to load more data:", error);
      }
    },
    [symbol, selectedInterval]
  );

  // 최소 시간 계산
  const minTime = useMemo(() => {
    if (allChartData.length === 0) return undefined;
    return Math.min(...allChartData.map((item) => item.time));
  }, [allChartData]);

  const isLoading = isPriceLoading || isKlinesLoading;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* 히어로 섹션 */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-100 mb-4">
          CryptoQuant
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-8">
          실시간 암호화폐 시세 데이터를 시각적으로 확인하세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/markets" className="btn-primary">
            시장 조회 시작하기
          </Link>
          <Link href="/strategy/backtest" className="btn-secondary">
            백테스트 실행
          </Link>
        </div>
      </section>

      {/* 시장 요약 카드 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-neutral-100 mb-6">
          인기 암호화폐
        </h2>
        <PopularCoins />
      </section>

      {/* 차트 프리뷰 섹션 */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-100">
            BTC/USDT 가격 차트
          </h2>
          <Link
            href="/markets/btcusdt"
            className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
          >
            상세 보기 →
          </Link>
        </div>
        <PriceHeader
          symbol={symbol}
          price={marketData?.price}
          change24h={marketData?.change24h}
          changePercent24h={marketData?.changePercent24h}
          volume24h={marketData?.volume24h}
        />
        <IntervalSelector
          selectedInterval={selectedInterval}
          onIntervalChange={setSelectedInterval}
        />
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
        <TradingChart
          data={allChartData.length > 0 ? allChartData : undefined}
          isLoading={isLoading}
          onLoadMoreData={handleLoadMoreData}
          minTime={minTime}
          resetKey={`${selectedInterval}-${selectedPeriod}`}
        />
      </section>

      {/* 주요 기능 섹션 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-neutral-100 mb-2">
            실시간 차트
          </h3>
          <p className="text-neutral-400 text-sm">
            주요 암호화폐의 실시간 시세를 차트로 확인하세요.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-neutral-100 mb-2">
            자동매매 전략
          </h3>
          <p className="text-neutral-400 text-sm">
            다양한 전략을 설정하고 백테스트를 통해 성과를 확인하세요.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-bold text-neutral-100 mb-2">성과 분석</h3>
          <p className="text-neutral-400 text-sm">
            누적 수익률, 거래 횟수, 최대 낙폭 등을 분석하세요.
          </p>
        </div>
      </section>

      {/* 안내 섹션 */}
      <section className="mt-12 card bg-neutral-800 border border-warning/20">
        <div className="flex items-start gap-4">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-lg font-bold text-neutral-100 mb-2">
              안내사항
            </h3>
            <p className="text-neutral-400 text-sm">
              본 서비스는 실제 거래를 실행하지 않으며, 모든 자동매매 기능은 학습
              및 시뮬레이션 목적으로만 제공됩니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
