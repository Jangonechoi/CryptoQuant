"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import PriceHeader from "@/components/market/PriceHeader";
import TradingChart from "@/components/market/TradingChart";
import IndicatorPanel, {
  type IndicatorSettings,
} from "@/components/market/IndicatorPanel";
import IntervalSelector from "@/components/market/IntervalSelector";
import PeriodSelector from "@/components/market/PeriodSelector";
import NewsPanel from "@/components/market/NewsPanel";
import SocialPanel from "@/components/market/SocialPanel";
import { useMarketStore } from "@/store/marketStore";
import { useMarketPrice, useKlines, fetchKlines } from "@/lib/api/queries";
import { calculateLimitByPeriod } from "@/lib/utils/periodLimit";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  type PriceData,
} from "@/lib/utils/indicators";

export default function MarketPage({ params }: { params: { symbol: string } }) {
  const { selectedInterval, setSelectedInterval } = useMarketStore();
  const symbol = params.symbol.toUpperCase();
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
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
  const neededLimit = useMemo(
    () => calculateLimitByPeriod(selectedPeriod, selectedInterval),
    [selectedPeriod, selectedInterval]
  );

  // Binance API는 최대 1000개까지만 반환하므로, 필요한 데이터가 1000개를 초과하면
  // 초기에는 1000개만 가져오고, 추가 데이터는 별도로 로드
  const initialLimit = useMemo(
    () => Math.min(neededLimit, 1000),
    [neededLimit]
  );

  const { data: marketData, isLoading: isPriceLoading } = useMarketPrice(
    symbol,
    selectedInterval
  );
  const { data: klinesData, isLoading: isKlinesLoading } = useKlines(
    symbol,
    selectedInterval,
    initialLimit
  );

  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>(
    {
      sma: { enabled: false, period: 20 },
      ema: { enabled: false, period: 20 },
      rsi: { enabled: false, period: 14 },
    }
  );

  const handleIndicatorChange = (settings: IndicatorSettings) => {
    setIndicatorSettings(settings);
  };

  // 캔들스틱 데이터 변환
  interface KlineData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }

  interface ChartDataItem {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }

  // 초기 데이터 로딩 및 추가 데이터 자동 로드
  const [isLoadingAdditionalData, setIsLoadingAdditionalData] = useState(false);
  const hasLoadedAdditionalDataRef = useRef(false);
  const resetKey = `${selectedInterval}-${selectedPeriod}`;

  // resetKey가 변경되면 ref 리셋
  useEffect(() => {
    hasLoadedAdditionalDataRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (klinesData?.data && klinesData.data.length > 0) {
      const newData = klinesData.data.map((kline: KlineData) => ({
        time: kline.time,
        open: kline.open,
        high: kline.high,
        low: kline.low,
        close: kline.close,
      }));

      // 시간순으로 정렬하고 중복 제거 (최적화: Set 기반)
      setAllChartData((prev) => {
        // Set을 사용하여 중복 제거 (O(n) 시간 복잡도)
        const timeSet = new Set(prev.map((item: ChartDataItem) => item.time));
        const newUniqueData = newData.filter(
          (item: ChartDataItem) => !timeSet.has(item.time)
        );

        if (newUniqueData.length === 0) {
          return prev; // 새로운 데이터가 없으면 이전 상태 유지
        }

        // 기존 데이터와 새 데이터 병합 후 정렬
        const merged = [...prev, ...newUniqueData];
        merged.sort((a, b) => a.time - b.time);
        return merged;
      });
    }
  }, [klinesData?.data]);

  // 필요한 데이터가 1000개를 초과하는 경우, 추가 데이터 자동 로드
  useEffect(() => {
    const loadAdditionalData = async () => {
      // 이미 로딩했거나 로딩 중이면 스킵
      if (hasLoadedAdditionalDataRef.current || isLoadingAdditionalData) {
        return;
      }

      // 필요한 데이터가 1000개 이하면 스킵
      if (neededLimit <= 1000) {
        return;
      }

      // 초기 데이터가 로드되지 않았으면 스킵
      if (!klinesData?.data || klinesData.data.length === 0) {
        return;
      }

      // 초기 데이터가 allChartData에 반영될 때까지 대기
      if (allChartData.length === 0) {
        return;
      }

      // 이미 필요한 만큼 로드되었는지 확인
      if (allChartData.length >= neededLimit) {
        hasLoadedAdditionalDataRef.current = true;
        return;
      }

      hasLoadedAdditionalDataRef.current = true;
      setIsLoadingAdditionalData(true);

      try {
        // 필요한 배치 수 계산
        const batches = Math.ceil(neededLimit / 1000);
        const remainingBatches = batches - 1; // 첫 번째 배치는 이미 로드됨

        // 현재 가장 오래된 데이터의 시간
        const startTime =
          allChartData.length > 0
            ? Math.min(...allChartData.map((item) => item.time))
            : klinesData.data[klinesData.data.length - 1]?.time;

        if (!startTime) {
          setIsLoadingAdditionalData(false);
          return;
        }

        // 병렬 처리로 여러 배치를 동시에 로드 (Binance API rate limit 고려: 초당 10회)
        // 동시 요청 수를 5개로 제한하여 rate limit 방지
        const MAX_CONCURRENT_REQUESTS = 5;
        const batchPromises: Array<Promise<ChartDataItem[]>> = [];

        // 각 배치에 대한 요청 생성
        for (let i = 0; i < remainingBatches; i++) {
          const currentCount = allChartData.length;
          const batchLimit = Math.min(
            1000,
            neededLimit - currentCount - i * 1000
          );
          if (batchLimit <= 0) break;

          // 각 배치의 시작 시간 계산 (이전 배치보다 이전 시간)
          // interval에 따라 대략적인 시간 간격 계산
          const intervalSeconds: Record<string, number> = {
            "1m": 60,
            "5m": 300,
            "15m": 900,
            "1h": 3600,
            "4h": 14400,
            "1d": 86400,
          };
          const intervalSec = intervalSeconds[selectedInterval] || 86400;
          const batchStartTime = startTime - i * 1000 * intervalSec; // 대략적인 추정

          batchPromises.push(
            fetchKlines(
              symbol,
              selectedInterval,
              batchLimit,
              batchStartTime - 1
            )
              .then((response) => {
                if (response?.data && response.data.length > 0) {
                  return response.data.map((kline: KlineData) => ({
                    time: kline.time,
                    open: kline.open,
                    high: kline.high,
                    low: kline.low,
                    close: kline.close,
                  }));
                }
                return [];
              })
              .catch((error) => {
                console.error(`Failed to load batch ${i}:`, error);
                return [];
              })
          );
        }

        // 배치를 그룹으로 나누어 순차 처리 (rate limit 방지)
        const batchGroups: Array<Promise<ChartDataItem[]>>[] = [];
        for (
          let i = 0;
          i < batchPromises.length;
          i += MAX_CONCURRENT_REQUESTS
        ) {
          batchGroups.push(batchPromises.slice(i, i + MAX_CONCURRENT_REQUESTS));
        }

        // 각 그룹을 순차적으로 처리하되, 그룹 내에서는 병렬 처리
        const allBatchData: ChartDataItem[] = [];
        for (const group of batchGroups) {
          const groupResults = await Promise.all(group);

          // 각 그룹의 결과를 즉시 병합하여 점진적 업데이트
          const groupData = groupResults.flat();
          if (groupData.length > 0) {
            allBatchData.push(...groupData);

            // 점진적 업데이트: 사용자가 데이터를 빠르게 볼 수 있도록
            setAllChartData((prev) => {
              const timeSet = new Set(prev.map((item) => item.time));
              const newUniqueData = groupData.filter(
                (item) => !timeSet.has(item.time)
              );

              if (newUniqueData.length === 0) {
                return prev;
              }

              const merged = [...prev, ...newUniqueData];
              merged.sort((a, b) => a.time - b.time);
              return merged;
            });
          }

          // 그룹 간 최소 지연 (rate limit 방지)
          if (batchGroups.indexOf(group) < batchGroups.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      } catch (error) {
        console.error("Failed to load additional data:", error);
        hasLoadedAdditionalDataRef.current = false; // 실패 시 재시도 가능하도록
      } finally {
        setIsLoadingAdditionalData(false);
      }
    };

    // 초기 데이터가 로드된 후 추가 데이터 로드 (한 번만)
    if (
      klinesData?.data &&
      klinesData.data.length > 0 &&
      allChartData.length > 0 &&
      !hasLoadedAdditionalDataRef.current &&
      !isLoadingAdditionalData
    ) {
      loadAdditionalData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klinesData?.data, neededLimit, symbol, selectedInterval]);

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

          // 기존 데이터와 병합 (중복 제거 및 정렬 - 최적화)
          setAllChartData((prev) => {
            // Set을 사용하여 중복 제거 (O(n) 시간 복잡도)
            const timeSet = new Set(
              prev.map((item: ChartDataItem) => item.time)
            );
            const newUniqueData = newData.filter(
              (item: ChartDataItem) => !timeSet.has(item.time)
            );

            if (newUniqueData.length === 0) {
              return prev; // 새로운 데이터가 없으면 이전 상태 유지
            }

            // 기존 데이터와 새 데이터 병합 후 정렬
            const merged = [...prev, ...newUniqueData];
            merged.sort((a, b) => a.time - b.time);
            return merged;
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

  const chartData = useMemo(() => {
    return allChartData.length > 0 ? allChartData : [];
  }, [allChartData]);

  // 지표 데이터 계산
  const indicatorData = useMemo(() => {
    if (!klinesData?.data || chartData.length === 0) {
      return {};
    }

    const priceData: PriceData[] = chartData.map((item: ChartDataItem) => ({
      time: item.time,
      close: item.close,
      high: item.high,
      low: item.low,
    }));

    const result: {
      sma?: Array<{ time: number; value: number }>;
      ema?: Array<{ time: number; value: number }>;
      rsi?: Array<{ time: number; value: number }>;
    } = {};

    if (indicatorSettings.sma.enabled) {
      result.sma = calculateSMA(priceData, indicatorSettings.sma.period);
    }

    if (indicatorSettings.ema.enabled) {
      result.ema = calculateEMA(priceData, indicatorSettings.ema.period);
    }

    if (indicatorSettings.rsi.enabled) {
      result.rsi = calculateRSI(priceData, indicatorSettings.rsi.period);
    }

    return result;
  }, [klinesData, chartData, indicatorSettings]);

  const isLoading =
    isPriceLoading || isKlinesLoading || isLoadingAdditionalData;

  // 디버깅용 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    console.log("Chart Data:", {
      hasData: chartData.length > 0,
      dataLength: chartData.length,
      firstItem: chartData[0],
      isLoading,
      klinesData,
    });
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradingChart
            data={chartData.length > 0 ? chartData : undefined}
            isLoading={isLoading}
            indicators={indicatorSettings}
            indicatorData={indicatorData}
            onLoadMoreData={handleLoadMoreData}
            minTime={minTime}
            resetKey={resetKey}
          />
        </div>
        <div>
          <IndicatorPanel onIndicatorChange={handleIndicatorChange} />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <NewsPanel symbol={symbol} />
        <SocialPanel symbol={symbol} />
      </div>
    </div>
  );
}
