"use client";

import PriceHeader from "@/components/market/PriceHeader";
import TradingChart from "@/components/market/TradingChart";
import IndicatorPanel from "@/components/market/IndicatorPanel";
import IntervalSelector from "@/components/market/IntervalSelector";
import { useMarketStore } from "@/store/marketStore";
import { useMarketPrice, useKlines } from "@/lib/api/queries";

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

  const handleIndicatorToggle = (indicator: string, enabled: boolean) => {
    // 지표 토글 로직 (추후 구현)
    console.log(`Indicator ${indicator}: ${enabled ? "enabled" : "disabled"}`);
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

  const chartData =
    klinesData?.data?.map((kline: KlineData) => ({
      time: kline.time,
      open: kline.open,
      high: kline.high,
      low: kline.low,
      close: kline.close,
    })) || [];

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <TradingChart data={chartData} isLoading={isLoading} />
        </div>
        <div>
          <IndicatorPanel onIndicatorToggle={handleIndicatorToggle} />
        </div>
      </div>
    </div>
  );
}
