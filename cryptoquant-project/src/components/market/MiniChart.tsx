"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  LineSeries,
  LineSeriesPartialOptions,
} from "lightweight-charts";
import Link from "next/link";
import { useKlines, useMarketPrice } from "@/lib/api/queries";
import { getCoinLogoUrl } from "@/lib/utils/coinLogo";

interface MiniChartProps {
  symbol: string;
  name: string;
  height?: number;
}

export default function MiniChart({
  symbol,
  name,
  height = 200,
}: MiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  const { data: priceData } = useMarketPrice(symbol, "1d");
  const { data: klinesData, isLoading } = useKlines(symbol, "1d", 30);

  // 차트 초기화
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const initChart = () => {
      if (!chartContainerRef.current) return;

      const containerWidth = chartContainerRef.current.clientWidth;
      if (containerWidth === 0) {
        setTimeout(initChart, 100);
        return;
      }

      try {
        const chart = createChart(chartContainerRef.current, {
          width: containerWidth,
          height: height,
          layout: {
            background: { color: "transparent" },
            textColor: "#9CA3AF",
          },
          grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
          },
          timeScale: {
            visible: false,
          },
          rightPriceScale: {
            visible: false,
          },
          leftPriceScale: {
            visible: false,
          },
          crosshair: {
            mode: 0, // Normal
          },
        });

        chartRef.current = chart;

        const lineOptions: LineSeriesPartialOptions = {
          color:
            priceData?.changePercent24h && priceData.changePercent24h >= 0
              ? "#16C784"
              : "#EA3943",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        };

        const lineSeries = chart.addSeries(LineSeries, lineOptions);
        seriesRef.current = lineSeries;

        setIsChartReady(true);
      } catch (error) {
        console.error("Error creating chart:", error);
      }
    };

    const timer = setTimeout(initChart, 100);

    return () => {
      clearTimeout(timer);
      if (chartRef.current) {
        chartRef.current.remove();
      }
      setIsChartReady(false);
      seriesRef.current = null;
    };
  }, [height, priceData?.changePercent24h]);

  // 데이터 설정
  useEffect(() => {
    if (
      !isChartReady ||
      !seriesRef.current ||
      !klinesData?.data ||
      klinesData.data.length === 0
    ) {
      return;
    }

    const formattedData = klinesData.data.map(
      (item: {
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }) => ({
        time: item.time,
        value: item.close,
      })
    );

    try {
      if (
        seriesRef.current &&
        typeof seriesRef.current.setData === "function"
      ) {
        seriesRef.current.setData(formattedData);
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      }
    } catch (error) {
      console.error("Error setting chart data:", error);
    }
  }, [klinesData, isChartReady]);

  const baseSymbol = symbol.replace("USDT", "").toUpperCase();
  const isPositive = (priceData?.changePercent24h || 0) >= 0;
  const logoUrl = getCoinLogoUrl(symbol, "large");

  return (
    <Link
      href={`/markets/${symbol.toLowerCase()}`}
      className="card p-3 hover:bg-neutral-700 transition-colors block"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-10 h-10 flex-shrink-0">
          <img
            src={logoUrl}
            alt={baseSymbol}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-neutral-100 truncate">
            {baseSymbol}
          </h3>
          <p className="text-xs text-neutral-400 truncate">{name}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-neutral-100">
            US$
            {priceData?.price
              ? priceData.price.toLocaleString(undefined, {
                  maximumFractionDigits: priceData.price < 1 ? 6 : 2,
                })
              : "---"}
          </p>
          <p
            className={`text-sm font-bold ${
              isPositive ? "text-success" : "text-danger"
            }`}
          >
            {isPositive ? "+" : ""}
            {priceData?.changePercent24h
              ? priceData.changePercent24h.toFixed(2)
              : "0.00"}
            %
          </p>
        </div>

        <div
          ref={chartContainerRef}
          className="w-full"
          style={{ height: `${height}px` }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-neutral-400">로딩 중...</div>
          </div>
        )}
      </div>
    </Link>
  );
}
