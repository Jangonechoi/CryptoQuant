"use client";

import { useState, useMemo } from "react";
import PriceHeader from "@/components/market/PriceHeader";
import TradingChart from "@/components/market/TradingChart";
import IndicatorPanel, {
  type IndicatorSettings,
} from "@/components/market/IndicatorPanel";
import IntervalSelector from "@/components/market/IntervalSelector";
import { useMarketStore } from "@/store/marketStore";
import { useMarketPrice, useKlines } from "@/lib/api/queries";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  type PriceData,
} from "@/lib/utils/indicators";

export default function MarketPage({ params }: { params: { symbol: string } }) {
  const { selectedInterval, setSelectedInterval } = useMarketStore();
  const symbol = params.symbol.toUpperCase();

  const { data: marketData, isLoading: isPriceLoading } = useMarketPrice(
    symbol,
    selectedInterval
  );
  const { data: klinesData, isLoading: isKlinesLoading } = useKlines(
    symbol,
    selectedInterval,
    100
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

  const chartData: ChartDataItem[] = useMemo(() => {
    return (
      klinesData?.data?.map((kline: KlineData) => ({
        time: kline.time,
        open: kline.open,
        high: kline.high,
        low: kline.low,
        close: kline.close,
      })) || []
    );
  }, [klinesData?.data]);

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

  const isLoading = isPriceLoading || isKlinesLoading;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradingChart
            data={chartData}
            isLoading={isLoading}
            indicators={indicatorSettings}
            indicatorData={indicatorData}
          />
        </div>
        <div>
          <IndicatorPanel onIndicatorChange={handleIndicatorChange} />
        </div>
      </div>
    </div>
  );
}
