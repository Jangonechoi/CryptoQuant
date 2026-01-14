"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  LineSeries,
  LineSeriesPartialOptions,
  PriceScaleMode,
} from "lightweight-charts";
import Card from "@/components/ui/Card";

interface EquityChartProps {
  equityCurve?: Array<{
    time: number;
    value: number;
  }>;
  isLoading?: boolean;
}

export default function EquityChart({
  equityCurve,
  isLoading = false,
}: EquityChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const equitySeriesRef = useRef<any>(null);
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
          rightPriceScale: {
            mode: PriceScaleMode.Normal,
          },
        });

        chartRef.current = chart;

        const equityOptions: LineSeriesPartialOptions = {
          color: "#3B82F6",
          lineWidth: 2,
          title: "자산 곡선",
          priceLineVisible: false,
          lastValueVisible: true,
        };

        const equitySeries = chart.addSeries(LineSeries, equityOptions);
        equitySeriesRef.current = equitySeries;

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
      equitySeriesRef.current = null;
    };
  }, []);

  // 데이터 설정
  useEffect(() => {
    if (!isChartReady || !equitySeriesRef.current) {
      return;
    }

    // 데이터가 없으면 빈 배열로 설정
    if (!equityCurve || equityCurve.length === 0) {
      try {
        equitySeriesRef.current.setData([]);
      } catch (error) {
        console.error("Error clearing equity curve data:", error);
      }
      return;
    }

    try {
      const formattedData = equityCurve.map((item) => ({
        time: item.time,
        value: item.value,
      }));

      // 데이터를 완전히 교체
      equitySeriesRef.current.setData(formattedData);

      // 차트 크기 조정을 약간 지연시켜 DOM 업데이트 완료 대기
      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      }, 50);
    } catch (error) {
      console.error("Error setting equity curve data:", error);
    }
  }, [equityCurve, isChartReady]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-neutral-400">차트 데이터 로딩 중...</div>
        </div>
      </Card>
    );
  }

  if (!equityCurve || equityCurve.length === 0) {
    return (
      <Card className="h-full">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-neutral-400">자산 곡선 데이터가 없습니다.</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden h-full">
      <div className="p-3 border-b border-neutral-700">
        <h3 className="text-base font-semibold text-neutral-100">수익 차트</h3>
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
