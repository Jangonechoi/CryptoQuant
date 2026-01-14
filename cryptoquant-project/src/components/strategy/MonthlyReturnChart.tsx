"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  HistogramSeries,
  HistogramSeriesPartialOptions,
  PriceScaleMode,
} from "lightweight-charts";
import Card from "@/components/ui/Card";

interface MonthlyReturnChartProps {
  monthlyReturns?: Array<{
    time: number;
    value: number;
  }>;
  isLoading?: boolean;
}

export default function MonthlyReturnChart({
  monthlyReturns,
  isLoading = false,
}: MonthlyReturnChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
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

        const seriesOptions: HistogramSeriesPartialOptions = {
          color: "#3B82F6",
          title: "월간 수익률",
          priceLineVisible: false,
          lastValueVisible: true,
        };

        const histogramSeries = chart.addSeries(HistogramSeries, seriesOptions);
        seriesRef.current = histogramSeries;

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
      seriesRef.current = null;
    };
  }, []);

  // 데이터 설정
  useEffect(() => {
    if (!isChartReady || !seriesRef.current) {
      return;
    }

    // 데이터가 없으면 빈 배열로 설정
    if (!monthlyReturns || monthlyReturns.length === 0) {
      try {
        seriesRef.current.setData([]);
      } catch (error) {
        console.error("Error clearing monthly returns data:", error);
      }
      return;
    }

    try {
      const formattedData = monthlyReturns.map((item) => ({
        time: item.time,
        value: item.value,
        color: item.value >= 0 ? "#10B981" : "#EF4444",
      }));

      // 데이터를 완전히 교체
      seriesRef.current.setData(formattedData);

      // 차트 크기 조정을 약간 지연시켜 DOM 업데이트 완료 대기
      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      }, 50);
    } catch (error) {
      console.error("Error setting monthly returns data:", error);
    }
  }, [monthlyReturns, isChartReady]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-neutral-400">차트 데이터 로딩 중...</div>
        </div>
      </Card>
    );
  }

  if (!monthlyReturns || monthlyReturns.length === 0) {
    return (
      <Card className="h-full">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-neutral-400">월간 수익률 데이터가 없습니다.</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden h-full">
      <div className="p-3 border-b border-neutral-700">
        <h3 className="text-base font-semibold text-neutral-100">
          월간 수익률
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
