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
  onLoadMoreData?: (startTime: number) => void; // 이전 데이터 로드 요청 콜백
  minTime?: number; // 현재 로드된 데이터의 최소 시간
  resetKey?: string | number; // 데이터 리셋을 위한 키 (interval/period 변경 시)
}

export default function TradingChart({
  data,
  isLoading,
  indicators,
  indicatorData,
  onLoadMoreData,
  minTime,
  resetKey,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const smaSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emaSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rsiSeriesRef = useRef<any>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const lastLoadTimeRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);
  const previousDataLengthRef = useRef(0);
  const previousResetKeyRef = useRef<string | number | undefined>(undefined);

  // resetKey가 변경되면 초기 로드 플래그 리셋
  useEffect(() => {
    if (resetKey !== undefined && resetKey !== previousResetKeyRef.current) {
      isInitialLoadRef.current = true;
      previousDataLengthRef.current = 0;
      previousResetKeyRef.current = resetKey;
    }
  }, [resetKey]);

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

          // RSI 차트는 별도 useEffect에서 초기화 (조건부 렌더링 때문에)

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
          // RSI 차트도 리사이즈
          if (rsiChartContainerRef.current && rsiChartRef.current) {
            const newWidth = rsiChartContainerRef.current.clientWidth;
            if (newWidth > 0) {
              rsiChartRef.current.applyOptions({
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
      rsiSeriesRef.current = null;
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
      }
    };
  }, []);

  // RSI 차트 초기화 (별도 useEffect로 분리)
  useEffect(() => {
    if (!isChartReady || !chartRef.current) {
      return;
    }

    // RSI가 활성화되어 있고 차트가 아직 초기화되지 않았을 때만 초기화
    if (indicators?.rsi.enabled && !rsiChartRef.current) {
      const initRSIChart = () => {
        if (!rsiChartContainerRef.current || !chartRef.current) {
          // 컨테이너가 아직 준비되지 않았으면 재시도
          setTimeout(initRSIChart, 100);
          return;
        }

        // 컨테이너를 먼저 표시해야 clientWidth를 얻을 수 있음
        rsiChartContainerRef.current.style.display = "block";

        // 강제로 리플로우를 발생시켜 레이아웃 계산
        void rsiChartContainerRef.current.offsetWidth;

        const rsiContainerWidth = rsiChartContainerRef.current.clientWidth;
        if (rsiContainerWidth === 0) {
          // 컨테이너가 아직 준비되지 않았으면 재시도
          setTimeout(initRSIChart, 100);
          return;
        }

        try {
          const rsiChart = createChart(rsiChartContainerRef.current, {
            width: rsiContainerWidth,
            height: 200,
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
              visible: true,
              scaleMargins: {
                top: 0.1,
                bottom: 0.1,
              },
            },
          });

          rsiChartRef.current = rsiChart;

          // RSI 라인 시리즈 초기화
          const rsiOptions: LineSeriesPartialOptions = {
            color: "#8B5CF6",
            lineWidth: 2,
            title: "RSI",
            priceLineVisible: false,
            lastValueVisible: true,
          };
          const rsiSeries = rsiChart.addSeries(LineSeries, rsiOptions);
          rsiSeriesRef.current = rsiSeries;

          // RSI 기준선 추가 (70, 50, 30)
          rsiSeries.createPriceLine({
            price: 70,
            color: "#EF4444",
            lineWidth: 1,
            lineStyle: 2, // dashed
            axisLabelVisible: true,
            title: "과매수",
          });
          rsiSeries.createPriceLine({
            price: 50,
            color: "#6B7280",
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
          });
          rsiSeries.createPriceLine({
            price: 30,
            color: "#10B981",
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: "과매도",
          });

          // 메인 차트와 RSI 차트 시간 스케일 동기화
          chartRef.current
            .timeScale()
            .subscribeVisibleTimeRangeChange((timeRange) => {
              if (timeRange && rsiChart.timeScale()) {
                try {
                  rsiChart.timeScale().setVisibleRange(timeRange);
                } catch {
                  // 무시 (범위 설정 실패 시)
                }
              }
            });

          // RSI 차트의 시간 스케일 변경도 메인 차트에 반영 (양방향 동기화)
          rsiChart.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
            if (timeRange && chartRef.current?.timeScale()) {
              try {
                chartRef.current.timeScale().setVisibleRange(timeRange);
              } catch {
                // 무시
              }
            }
          });

          console.log("RSI chart initialized successfully");
        } catch (error) {
          console.error("Error creating RSI chart:", error);
        }
      };

      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행
      const timer = setTimeout(initRSIChart, 200);
      return () => {
        clearTimeout(timer);
      };
    } else if (!indicators?.rsi.enabled && rsiChartRef.current) {
      // RSI가 비활성화되면 차트 제거
      try {
        rsiChartRef.current.remove();
      } catch (error) {
        console.error("Error removing RSI chart:", error);
      }
      rsiChartRef.current = null;
      rsiSeriesRef.current = null;
    }
  }, [isChartReady, indicators?.rsi.enabled]);

  // 가시 시간 범위 변경 감지 (스크롤/확대-축소 시)
  useEffect(() => {
    if (
      !isChartReady ||
      !chartRef.current ||
      !onLoadMoreData ||
      minTime === undefined
    ) {
      return;
    }

    const timeScale = chartRef.current.timeScale();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (timeRangeParam: any) => {
      if (!timeRangeParam || isLoadingMoreRef.current) return;

      // 왼쪽으로 스크롤되어 이전 데이터가 필요할 때
      const visibleStartTime =
        typeof timeRangeParam.from === "number"
          ? timeRangeParam.from
          : parseInt(String(timeRangeParam.from));

      // 현재 보이는 시작 시간이 로드된 최소 시간보다 이전이면 추가 데이터 요청
      // 10% 버퍼를 두어 미리 로드
      const visibleTimeRange = timeScale.getVisibleRange();
      if (!visibleTimeRange) return;

      const timeSpan =
        (typeof visibleTimeRange.to === "number"
          ? visibleTimeRange.to
          : parseInt(String(visibleTimeRange.to))) -
        (typeof visibleTimeRange.from === "number"
          ? visibleTimeRange.from
          : parseInt(String(visibleTimeRange.from)));
      const buffer = timeSpan * 0.1; // 보이는 범위의 10% 버퍼
      const threshold = minTime + buffer;

      if (visibleStartTime < threshold) {
        // 마지막 로드 시간과 충분히 차이가 날 때만 요청 (디바운싱)
        const now = Date.now();
        if (!lastLoadTimeRef.current || now - lastLoadTimeRef.current > 1000) {
          isLoadingMoreRef.current = true;
          lastLoadTimeRef.current = now;

          // 이전 데이터 로드 요청 (현재 최소 시간 이전)
          onLoadMoreData(minTime - 1);

          // 로딩 완료 후 플래그 리셋 (약간의 지연)
          setTimeout(() => {
            isLoadingMoreRef.current = false;
          }, 2000);
        }
      }
    };

    timeScale.subscribeVisibleTimeRangeChange(handler);

    // cleanup은 필요 없음 (차트가 제거될 때 자동으로 정리됨)
    return () => {
      // 구독 해제는 차트 제거 시 자동으로 처리됨
    };
  }, [isChartReady, onLoadMoreData, minTime]);

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
      isInitialLoad: isInitialLoadRef.current,
      previousLength: previousDataLengthRef.current,
    });

    try {
      if (
        seriesRef.current &&
        typeof seriesRef.current.setData === "function"
      ) {
        const isNewData = data.length > previousDataLengthRef.current;
        const isInitialLoad = isInitialLoadRef.current;

        // 현재 보이는 시간 범위 저장 (데이터 추가 시 복원하기 위해)
        let savedVisibleRange: { from: number; to: number } | null = null;
        if (chartRef.current && !isInitialLoad && isNewData) {
          const timeScale = chartRef.current.timeScale();
          const visibleRange = timeScale.getVisibleRange();
          if (visibleRange) {
            savedVisibleRange = {
              from:
                typeof visibleRange.from === "number"
                  ? visibleRange.from
                  : parseInt(String(visibleRange.from)),
              to:
                typeof visibleRange.to === "number"
                  ? visibleRange.to
                  : parseInt(String(visibleRange.to)),
            };
          }
        }

        // 데이터 설정
        seriesRef.current.setData(formattedData);
        console.log("Data set successfully");

        // 차트 크기 조정
        if (chartRef.current) {
          const timeScale = chartRef.current.timeScale();

          if (isInitialLoad) {
            // 초기 로드 시에만 fitContent 호출
            timeScale.fitContent();
            console.log("Chart fitted to content (initial load)");
            isInitialLoadRef.current = false;
          } else if (isNewData && savedVisibleRange) {
            // 새 데이터가 추가된 경우, 이전 보이는 범위 복원
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            timeScale.setVisibleRange({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              from: savedVisibleRange.from as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              to: savedVisibleRange.to as any,
            });
            console.log("Visible range restored:", savedVisibleRange);
          }
        }

        previousDataLengthRef.current = data.length;
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

      // RSI 데이터 설정
      if (
        indicators.rsi.enabled &&
        indicatorData.rsi &&
        indicatorData.rsi.length > 0 &&
        rsiSeriesRef.current &&
        rsiChartRef.current
      ) {
        const rsiFormatted = indicatorData.rsi.map((item) => ({
          time: item.time,
          value: item.value,
        }));
        rsiSeriesRef.current.setData(rsiFormatted);
        rsiSeriesRef.current.applyOptions({ visible: true });

        // RSI 차트 시간 스케일을 메인 차트와 동기화
        if (rsiChartRef.current && chartRef.current) {
          try {
            const mainTimeScale = chartRef.current.timeScale();
            const visibleRange = mainTimeScale.getVisibleRange();
            if (visibleRange) {
              rsiChartRef.current.timeScale().setVisibleRange(visibleRange);
            }
          } catch (error) {
            console.error("Error syncing RSI chart time scale:", error);
          }
        }
      } else {
        if (rsiSeriesRef.current) {
          rsiSeriesRef.current.setData([]);
          rsiSeriesRef.current.applyOptions({ visible: false });
        }
      }
    } catch (error) {
      console.error("Error setting indicator data:", error);
    }
  }, [indicatorData, indicators, isChartReady]);

  return (
    <div className="space-y-4">
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
      {/* RSI 차트 패널 - 항상 렌더링하되 표시/숨김만 제어 */}
      {indicators?.rsi.enabled && (
        <div className="card p-0 overflow-hidden relative">
          <div className="p-2 bg-neutral-800 border-b border-neutral-700">
            <h3 className="text-sm font-semibold text-neutral-300">
              RSI (상대강도지수)
            </h3>
          </div>
          <div
            ref={rsiChartContainerRef}
            className="w-full h-[200px]"
            style={{ minWidth: "100%", minHeight: "200px" }}
          />
        </div>
      )}
    </div>
  );
}
