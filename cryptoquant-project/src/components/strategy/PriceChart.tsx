"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  CandlestickSeries,
  CandlestickSeriesPartialOptions,
  CrosshairMode,
} from "lightweight-charts";
import Card from "@/components/ui/Card";

interface TradeSignal {
  time: number;
  type: "buy" | "sell";
  price: number;
}

interface PriceChartProps {
  chartData?: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
  tradeSignals?: TradeSignal[];
  isLoading?: boolean;
}

export default function PriceChart({
  chartData,
  tradeSignals,
  isLoading = false,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  // 차트 초기화
  useEffect(() => {
    let resizeHandler: (() => void) | null = null;

    const initChart = () => {
      if (!chartContainerRef.current) {
        setTimeout(initChart, 100);
        return;
      }

      const containerWidth = chartContainerRef.current.clientWidth;
      if (containerWidth === 0) {
        setTimeout(initChart, 100);
        return;
      }

      try {
        const chart = createChart(chartContainerRef.current, {
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

        chartRef.current = chart;

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

        setIsChartReady(true);

        resizeHandler = () => {
          if (chartContainerRef.current && chartRef.current) {
            const newWidth = chartContainerRef.current.clientWidth;
            if (newWidth > 0) {
              chartRef.current.applyOptions({
                width: newWidth,
              });
            }
          }
        };

        window.addEventListener("resize", resizeHandler);
      } catch (error) {
        console.error("Error creating chart:", error);
      }
    };

    const timer = setTimeout(initChart, 100);

    return () => {
      clearTimeout(timer);
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
      setIsChartReady(false);
      candlestickSeriesRef.current = null;
    };
  }, []);

  // 데이터 설정
  useEffect(() => {
    if (!isChartReady || !candlestickSeriesRef.current) {
      return;
    }

    // 데이터가 없으면 빈 배열로 설정
    if (!chartData || chartData.length === 0) {
      try {
        candlestickSeriesRef.current.setData([]);
        candlestickSeriesRef.current.setMarkers([]);
      } catch (error) {
        console.error("Error clearing chart data:", error);
      }
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

      // 데이터를 완전히 교체
      candlestickSeriesRef.current.setData(formattedData);

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
      } else {
        candlestickSeriesRef.current.setMarkers([]);
      }

      // 차트 크기 조정을 약간 지연시켜 DOM 업데이트 완료 대기
      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      }, 50);
    } catch (error) {
      console.error("Error setting chart data:", error);
    }
  }, [chartData, isChartReady, tradeSignals]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-neutral-400">차트 데이터 로딩 중...</div>
        </div>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="h-full">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-neutral-400">차트 데이터가 없습니다.</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden h-full">
      <div className="p-3 border-b border-neutral-700">
        <h3 className="text-base font-semibold text-neutral-100">
          백테스트 차트
        </h3>
      </div>
      <div className="p-3">
        <div
          ref={chartContainerRef}
          className="w-full h-[400px]"
          style={{ minWidth: "100%", minHeight: "400px" }}
        />
      </div>
    </Card>
  );
}
