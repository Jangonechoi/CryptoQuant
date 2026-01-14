"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  CandlestickSeries,
  LineSeries,
  CandlestickSeriesPartialOptions,
  LineSeriesPartialOptions,
  CrosshairMode,
  PriceScaleMode,
} from "lightweight-charts";
import Card from "@/components/ui/Card";

interface TradeSignal {
  time: number;
  type: "buy" | "sell";
  price: number;
}

interface BacktestChartProps {
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
  tradeSignals?: TradeSignal[];
  isLoading?: boolean;
}

export default function BacktestChart({
  chartData,
  equityCurve,
  tradeSignals,
  isLoading = false,
}: BacktestChartProps) {
  const priceChartContainerRef = useRef<HTMLDivElement>(null);
  const equityChartContainerRef = useRef<HTMLDivElement>(null);
  const priceChartRef = useRef<IChartApi | null>(null);
  const equityChartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const equitySeriesRef = useRef<any>(null);
  const [isPriceChartReady, setIsPriceChartReady] = useState(false);
  const [isEquityChartReady, setIsEquityChartReady] = useState(false);

  // 가격 차트 초기화
  useEffect(() => {
    let resizeHandler: (() => void) | null = null;

    const initPriceChart = () => {
      if (!priceChartContainerRef.current) {
        setTimeout(initPriceChart, 100);
        return;
      }

      const containerWidth = priceChartContainerRef.current.clientWidth;
      if (containerWidth === 0) {
        setTimeout(initPriceChart, 100);
        return;
      }

      try {
        const chart = createChart(priceChartContainerRef.current, {
          width: containerWidth,
          height: 400,
          layout: {
            background: { color: "#111827" },
            textColor: "#E5E7EB",
          },
          grid: {
            vertLines: { color: "#374151" },
            horzLines: { color: "#374151" },
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
          crosshair: {
            mode: CrosshairMode.Normal,
          },
        });

        priceChartRef.current = chart;

        // 캔들스틱 시리즈 추가
        const candlestickOptions: CandlestickSeriesPartialOptions = {
          upColor: "#16C784",
          downColor: "#EA3943",
          borderVisible: false,
          wickUpColor: "#16C784",
          wickDownColor: "#EA3943",
        };

        const candlestickSeries = chart.addSeries(
          CandlestickSeries,
          candlestickOptions
        );
        candlestickSeriesRef.current = candlestickSeries;

        setIsPriceChartReady(true);

        // 리사이즈 핸들러
        resizeHandler = () => {
          if (priceChartContainerRef.current && priceChartRef.current) {
            const newWidth = priceChartContainerRef.current.clientWidth;
            if (newWidth > 0) {
              priceChartRef.current.applyOptions({
                width: newWidth,
              });
            }
          }
        };

        window.addEventListener("resize", resizeHandler);
      } catch (error) {
        console.error("Error creating price chart:", error);
      }
    };

    const timer = setTimeout(initPriceChart, 100);

    return () => {
      clearTimeout(timer);
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      if (priceChartRef.current) {
        priceChartRef.current.remove();
      }
      setIsPriceChartReady(false);
      candlestickSeriesRef.current = null;
    };
  }, []);

  // 자산 곡선 차트 초기화
  useEffect(() => {
    let resizeHandler: (() => void) | null = null;

    const initEquityChart = () => {
      if (!equityChartContainerRef.current) {
        setTimeout(initEquityChart, 100);
        return;
      }

      const containerWidth = equityChartContainerRef.current.clientWidth;
      if (containerWidth === 0) {
        setTimeout(initEquityChart, 100);
        return;
      }

      try {
        const chart = createChart(equityChartContainerRef.current, {
          width: containerWidth,
          height: 400,
          layout: {
            background: { color: "#111827" },
            textColor: "#E5E7EB",
          },
          grid: {
            vertLines: { color: "#374151" },
            horzLines: { color: "#374151" },
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
          rightPriceScale: {
            mode: PriceScaleMode.Normal,
          },
        });

        equityChartRef.current = chart;

        // 자산 곡선 라인 시리즈 추가
        const equityOptions: LineSeriesPartialOptions = {
          color: "#3B82F6",
          lineWidth: 2,
          title: "자산 곡선",
          priceLineVisible: false,
          lastValueVisible: true,
        };

        const equitySeries = chart.addSeries(LineSeries, equityOptions);
        equitySeriesRef.current = equitySeries;

        setIsEquityChartReady(true);

        // 리사이즈 핸들러
        resizeHandler = () => {
          if (equityChartContainerRef.current && equityChartRef.current) {
            const newWidth = equityChartContainerRef.current.clientWidth;
            if (newWidth > 0) {
              equityChartRef.current.applyOptions({
                width: newWidth,
              });
            }
          }
        };

        window.addEventListener("resize", resizeHandler);
      } catch (error) {
        console.error("Error creating equity chart:", error);
      }
    };

    const timer = setTimeout(initEquityChart, 100);

    return () => {
      clearTimeout(timer);
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      if (equityChartRef.current) {
        equityChartRef.current.remove();
      }
      setIsEquityChartReady(false);
      equitySeriesRef.current = null;
    };
  }, []);

  // 가격 차트 데이터 설정
  useEffect(() => {
    if (
      !isPriceChartReady ||
      !candlestickSeriesRef.current ||
      !chartData ||
      chartData.length === 0
    ) {
      return;
    }

    try {
      const formattedData = chartData.map((item) => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      candlestickSeriesRef.current.setData(formattedData);

      // 거래 신호 마커 추가
      if (tradeSignals && tradeSignals.length > 0) {
        const markers = tradeSignals.map((signal) => ({
          time: signal.time,
          position:
            signal.type === "buy"
              ? ("belowBar" as const)
              : ("aboveBar" as const),
          color: signal.type === "buy" ? "#16C784" : "#EA3943",
          shape:
            signal.type === "buy"
              ? ("arrowUp" as const)
              : ("arrowDown" as const),
          text: signal.type === "buy" ? "매수" : "매도",
          size: 1.5,
        }));

        candlestickSeriesRef.current.setMarkers(markers);
      }

      if (priceChartRef.current) {
        priceChartRef.current.timeScale().fitContent();
      }
    } catch (error) {
      console.error("Error setting price chart data:", error);
    }
  }, [chartData, isPriceChartReady, tradeSignals]);

  // 자산 곡선 데이터 설정
  useEffect(() => {
    if (
      !isEquityChartReady ||
      !equitySeriesRef.current ||
      !equityCurve ||
      equityCurve.length === 0
    ) {
      return;
    }

    try {
      const formattedData = equityCurve.map((item) => ({
        time: item.time,
        value: item.value,
      }));

      equitySeriesRef.current.setData(formattedData);

      if (equityChartRef.current) {
        equityChartRef.current.timeScale().fitContent();
      }
    } catch (error) {
      console.error("Error setting equity curve data:", error);
    }
  }, [equityCurve, isEquityChartReady]);

  // 두 차트의 시간 스케일 동기화
  useEffect(() => {
    if (!priceChartRef.current || !equityChartRef.current) {
      return;
    }

    const priceTimeScale = priceChartRef.current.timeScale();
    const equityTimeScale = equityChartRef.current.timeScale();

    const syncHandler = () => {
      const visibleRange = priceTimeScale.getVisibleRange();
      if (visibleRange) {
        equityTimeScale.setVisibleRange(visibleRange);
      }
    };

    priceTimeScale.subscribeVisibleTimeRangeChange(syncHandler);

    return () => {
      priceTimeScale.unsubscribeVisibleTimeRangeChange(syncHandler);
    };
  }, [isPriceChartReady, isEquityChartReady]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-neutral-400">차트 데이터 로딩 중...</div>
          </div>
        </Card>
        <Card>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-neutral-400">차트 데이터 로딩 중...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-neutral-400">차트 데이터가 없습니다.</div>
          </div>
        </Card>
        <Card>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-neutral-400">차트 데이터가 없습니다.</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 왼쪽: 백테스트 차트 (가격 차트) */}
      <Card className="p-0 overflow-hidden">
        <div className="p-3 border-b border-neutral-700">
          <h3 className="text-base font-semibold text-neutral-100">
            백테스트 차트
          </h3>
        </div>
        <div className="p-3">
          <h4 className="text-xs font-medium text-neutral-300 mb-1">
            가격 차트
          </h4>
          <div
            ref={priceChartContainerRef}
            className="w-full h-[400px]"
            style={{ minWidth: "100%", minHeight: "400px" }}
          />
        </div>
      </Card>

      {/* 오른쪽: 수익 차트 (자산 곡선) */}
      {equityCurve && equityCurve.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <div className="p-3 border-b border-neutral-700">
            <h3 className="text-base font-semibold text-neutral-100">
              수익 차트
            </h3>
          </div>
          <div className="p-3">
            <h4 className="text-xs font-medium text-neutral-300 mb-1">
              자산 곡선
            </h4>
            <div
              ref={equityChartContainerRef}
              className="w-full h-[400px]"
              style={{ minWidth: "100%", minHeight: "400px" }}
            />
          </div>
        </Card>
      ) : (
        <Card>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-neutral-400">자산 곡선 데이터가 없습니다.</div>
          </div>
        </Card>
      )}
    </div>
  );
}
