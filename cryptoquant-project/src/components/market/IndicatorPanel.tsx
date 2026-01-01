"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";

interface IndicatorPanelProps {
  onIndicatorToggle: (indicator: string, enabled: boolean) => void;
}

export default function IndicatorPanel({
  onIndicatorToggle,
}: IndicatorPanelProps) {
  const [indicators, setIndicators] = useState({
    sma: false,
    ema: false,
    rsi: false,
  });

  const handleToggle = (indicator: keyof typeof indicators) => {
    const newValue = !indicators[indicator];
    setIndicators((prev) => ({ ...prev, [indicator]: newValue }));
    onIndicatorToggle(indicator, newValue);
  };

  return (
    <Card>
      <h3 className="text-lg font-bold text-neutral-100 mb-4">지표 설정</h3>
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-neutral-300">SMA (단순 이동평균)</span>
          <input
            type="checkbox"
            checked={indicators.sma}
            onChange={() => handleToggle("sma")}
            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-neutral-300">EMA (지수 이동평균)</span>
          <input
            type="checkbox"
            checked={indicators.ema}
            onChange={() => handleToggle("ema")}
            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-neutral-300">RSI (상대강도지수)</span>
          <input
            type="checkbox"
            checked={indicators.rsi}
            onChange={() => handleToggle("rsi")}
            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
          />
        </label>
      </div>
    </Card>
  );
}

