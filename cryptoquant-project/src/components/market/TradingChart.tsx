"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  CandlestickSeriesPartialOptions,
  CandlestickSeries,
  LineSeries,
  LineSeriesPartialOptions,
} from "lightweight-charts";
import type { IndicatorSettings } from "./IndicatorPanel";

interface TradingChartProps {
  data?: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
  isLoading?: boolean;
  indicators?: IndicatorSettings;
  indicatorData?: {
    sma?: Array<{ time: number; value: number }>;
    ema?: Array<{ time: number; value: number }>;
    rsi?: Array<{ time: number; value: number }>;
  };
}

export default function TradingChart({
  data,
  isLoading,
  indicators,
  indicatorData,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const smaSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emaSeriesRef = useRef<any>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  // 차트 초기화
  useEffect(() => {
    let resizeHandler: (() => void) | null = null;
    let retryCount = 0;
    const maxRetries = 10;

    const initChart = () => {
      if (!chartContainerRef.current) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(
            `Chart container not available, retrying... (${retryCount}/${maxRetries})`
          );
          setTimeout(initChart, 200);
        } else {
          console.error(
            "Failed to initialize chart: container not available after max retries"
          );
        }
        return;
      }

      // 컨테이너 너비 확인 및 설정
      const containerWidth = chartContainerRef.current.clientWidth;
      if (containerWidth === 0) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(
            `Container width is 0, retrying... (${retryCount}/${maxRetries})`
          );
          setTimeout(initChart, 200);
        } else {
          console.error(
            "Failed to initialize chart: container width is 0 after max retries"
          );
        }
        return;
      }

      console.log("Initializing chart...", {
        containerWidth,
        containerHeight: chartContainerRef.current.clientHeight,
      });

      // 차트 생성
      try {
        const chart = createChart(chartContainerRef.current, {
          width: containerWidth,
          height: 500,
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
        });

        chartRef.current = chart;

        // 캔들스틱 시리즈 추가
        try {
          const candlestickOptions: CandlestickSeriesPartialOptions = {
            upColor: "#16C784",
            downColor: "#EA3943",
            borderVisible: false,
            wickUpColor: "#16C784",
            wickDownColor: "#EA3943",
          };

          // v5에서는 addSeries를 사용하고 CandlestickSeries를 전달
          const candlestickSeries = chart.addSeries(
            CandlestickSeries,
            candlestickOptions
          );

          seriesRef.current = candlestickSeries;

          // SMA 라인 시리즈 초기화
          const smaOptions: LineSeriesPartialOptions = {
            color: "#3B82F6",
            lineWidth: 2,
            title: "SMA",
            priceLineVisible: false,
            lastValueVisible: true,
          };
          const smaSeries = chart.addSeries(LineSeries, smaOptions);
          smaSeriesRef.current = smaSeries;

          // EMA 라인 시리즈 초기화
          const emaOptions: LineSeriesPartialOptions = {
            color: "#F59E0B",
            lineWidth: 2,
            title: "EMA",
            priceLineVisible: false,
            lastValueVisible: true,
          };
          const emaSeries = chart.addSeries(LineSeries, emaOptions);
          emaSeriesRef.current = emaSeries;

          setIsChartReady(true);
          console.log("Chart initialized, series created", {
            series: candlestickSeries,
            hasSetData: typeof candlestickSeries?.setData === "function",
          });
        } catch (error) {
          console.error("Error creating candlestick series:", error);
        }

        // 리사이즈 핸들러
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

    // 초기화 시작 - 약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행
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
      smaSeriesRef.current = null;
      emaSeriesRef.current = null;
    };
  }, []);

  // 데이터 설정
  useEffect(() => {
    if (!isChartReady || !seriesRef.current || !data || data.length === 0) {
      console.log("Cannot set data:", {
        isChartReady,
        hasSeries: !!seriesRef.current,
        hasData: !!data,
        dataLength: data?.length || 0,
      });
      return;
    }

    // UnixTimestamp는 그냥 number로 전달
    const formattedData = data.map((item) => ({
      time: item.time, // UnixTimestamp (초 단위)
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    console.log("Setting chart data:", {
      count: formattedData.length,
      first: formattedData[0],
      last: formattedData[formattedData.length - 1],
    });

    try {
      if (
        seriesRef.current &&
        typeof seriesRef.current.setData === "function"
      ) {
        seriesRef.current.setData(formattedData);
        console.log("Data set successfully");

        // 차트 크기 조정
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
          console.log("Chart fitted to content");
        }
      } else {
        console.error("Series setData method not available", seriesRef.current);
      }
    } catch (error) {
      console.error("Error setting chart data:", error);
    }
  }, [data, isChartReady]);

  // 지표 데이터 설정
  useEffect(() => {
    if (!isChartReady || !indicatorData || !indicators) {
      return;
    }

    try {
      // SMA 데이터 설정
      if (
        indicators.sma.enabled &&
        indicatorData.sma &&
        indicatorData.sma.length > 0 &&
        smaSeriesRef.current
      ) {
        const smaFormatted = indicatorData.sma.map((item) => ({
          time: item.time,
          value: item.value,
        }));
        smaSeriesRef.current.setData(smaFormatted);
        smaSeriesRef.current.applyOptions({ visible: true });
      } else if (smaSeriesRef.current) {
        smaSeriesRef.current.setData([]);
        smaSeriesRef.current.applyOptions({ visible: false });
      }

      // EMA 데이터 설정
      if (
        indicators.ema.enabled &&
        indicatorData.ema &&
        indicatorData.ema.length > 0 &&
        emaSeriesRef.current
      ) {
        const emaFormatted = indicatorData.ema.map((item) => ({
          time: item.time,
          value: item.value,
        }));
        emaSeriesRef.current.setData(emaFormatted);
        emaSeriesRef.current.applyOptions({ visible: true });
      } else if (emaSeriesRef.current) {
        emaSeriesRef.current.setData([]);
        emaSeriesRef.current.applyOptions({ visible: false });
      }
    } catch (error) {
      console.error("Error setting indicator data:", error);
    }
  }, [indicatorData, indicators, isChartReady]);

  return (
    <div className="card p-0 overflow-hidden relative">
      <div
        ref={chartContainerRef}
        className="w-full h-[500px]"
        style={{ minWidth: "100%", minHeight: "500px" }}
      />
      {(isLoading || !data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800/80 z-10">
          <div className="text-neutral-400">
            {isLoading ? "차트 데이터 로딩 중..." : "차트 데이터가 없습니다."}
          </div>
        </div>
      )}
    </div>
  );
}
