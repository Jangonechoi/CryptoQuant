"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";

export interface IndicatorConfig {
  enabled: boolean;
  period: number;
}

export interface IndicatorSettings {
  sma: IndicatorConfig;
  ema: IndicatorConfig;
  rsi: IndicatorConfig;
}

interface IndicatorPanelProps {
  onIndicatorChange: (settings: IndicatorSettings) => void;
}

export default function IndicatorPanel({
  onIndicatorChange,
}: IndicatorPanelProps) {
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    sma: { enabled: false, period: 20 },
    ema: { enabled: false, period: 20 },
    rsi: { enabled: false, period: 14 },
  });

  // 지표 설정이 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    onIndicatorChange(indicators);
  }, [indicators, onIndicatorChange]);

  const handleToggle = (indicator: keyof IndicatorSettings) => {
    setIndicators((prev) => ({
      ...prev,
      [indicator]: {
        ...prev[indicator],
        enabled: !prev[indicator].enabled,
      },
    }));
  };

  const handlePeriodChange = (
    indicator: keyof IndicatorSettings,
    period: number
  ) => {
    const validPeriod = Math.max(1, Math.min(200, period)); // 1-200 범위로 제한
    setIndicators((prev) => ({
      ...prev,
      [indicator]: {
        ...prev[indicator],
        period: validPeriod,
      },
    }));
  };

  return (
    <Card>
      <h3 className="text-lg font-bold text-neutral-100 mb-4">지표 설정</h3>
      <div className="space-y-4">
        {/* SMA 설정 */}
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-neutral-300">SMA (단순 이동평균)</span>
            <input
              type="checkbox"
              checked={indicators.sma.enabled}
              onChange={() => handleToggle("sma")}
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
            />
          </label>
          {indicators.sma.enabled && (
            <div className="ml-4 flex items-center gap-2">
              <label className="text-sm text-neutral-400">기간:</label>
              <input
                type="number"
                min="1"
                max="200"
                value={indicators.sma.period}
                onChange={(e) =>
                  handlePeriodChange("sma", parseInt(e.target.value) || 20)
                }
                className="w-16 px-2 py-1 text-sm bg-neutral-700 text-neutral-100 rounded border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>

        {/* EMA 설정 */}
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-neutral-300">EMA (지수 이동평균)</span>
            <input
              type="checkbox"
              checked={indicators.ema.enabled}
              onChange={() => handleToggle("ema")}
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
            />
          </label>
          {indicators.ema.enabled && (
            <div className="ml-4 flex items-center gap-2">
              <label className="text-sm text-neutral-400">기간:</label>
              <input
                type="number"
                min="1"
                max="200"
                value={indicators.ema.period}
                onChange={(e) =>
                  handlePeriodChange("ema", parseInt(e.target.value) || 20)
                }
                className="w-16 px-2 py-1 text-sm bg-neutral-700 text-neutral-100 rounded border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>

        {/* RSI 설정 */}
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-neutral-300">RSI (상대강도지수)</span>
            <input
              type="checkbox"
              checked={indicators.rsi.enabled}
              onChange={() => handleToggle("rsi")}
              className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
            />
          </label>
          {indicators.rsi.enabled && (
            <div className="ml-4 flex items-center gap-2">
              <label className="text-sm text-neutral-400">기간:</label>
              <input
                type="number"
                min="1"
                max="200"
                value={indicators.rsi.period}
                onChange={(e) =>
                  handlePeriodChange("rsi", parseInt(e.target.value) || 14)
                }
                className="w-16 px-2 py-1 text-sm bg-neutral-700 text-neutral-100 rounded border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
