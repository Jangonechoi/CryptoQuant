"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface StrategyFormProps {
  onSubmit: (config: StrategyConfig) => void;
  isLoading?: boolean;
}

export interface StrategyConfig {
  symbol: string;
  interval: string;
  startDate: string;
  endDate: string;
  strategyType: "moving_average" | "rsi" | "macd";
  parameters: {
    shortPeriod?: number;
    longPeriod?: number;
    rsiPeriod?: number;
    rsiOverbought?: number;
    rsiOversold?: number;
  };
}

export default function StrategyForm({
  onSubmit,
  isLoading = false,
}: StrategyFormProps) {
  const [config, setConfig] = useState<StrategyConfig>({
    symbol: "BTCUSDT",
    interval: "1d",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    strategyType: "moving_average",
    parameters: {
      shortPeriod: 5,
      longPeriod: 20,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-neutral-100 mb-6">전략 설정</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 코인 선택 */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            암호화폐
          </label>
          <select
            value={config.symbol}
            onChange={(e) =>
              setConfig({ ...config, symbol: e.target.value })
            }
            className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="BNBUSDT">BNB/USDT</option>
          </select>
        </div>

        {/* 기간 선택 */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            시간 간격
          </label>
          <select
            value={config.interval}
            onChange={(e) =>
              setConfig({ ...config, interval: e.target.value })
            }
            className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1m">1분</option>
            <option value="5m">5분</option>
            <option value="15m">15분</option>
            <option value="1h">1시간</option>
            <option value="4h">4시간</option>
            <option value="1d">1일</option>
          </select>
        </div>

        {/* 날짜 범위 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              시작일
            </label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) =>
                setConfig({ ...config, startDate: e.target.value })
              }
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              종료일
            </label>
            <input
              type="date"
              value={config.endDate}
              onChange={(e) =>
                setConfig({ ...config, endDate: e.target.value })
              }
              className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 전략 타입 */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            전략 유형
          </label>
          <select
            value={config.strategyType}
            onChange={(e) =>
              setConfig({
                ...config,
                strategyType: e.target.value as StrategyConfig["strategyType"],
              })
            }
            className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="moving_average">이동평균 전략</option>
            <option value="rsi">RSI 전략</option>
            <option value="macd">MACD 전략</option>
          </select>
        </div>

        {/* 전략별 파라미터 */}
        {config.strategyType === "moving_average" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                단기 이동평균
              </label>
              <input
                type="number"
                value={config.parameters.shortPeriod || 5}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    parameters: {
                      ...config.parameters,
                      shortPeriod: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                장기 이동평균
              </label>
              <input
                type="number"
                value={config.parameters.longPeriod || 20}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    parameters: {
                      ...config.parameters,
                      longPeriod: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
          </div>
        )}

        {config.strategyType === "rsi" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                RSI 기간
              </label>
              <input
                type="number"
                value={config.parameters.rsiPeriod || 14}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    parameters: {
                      ...config.parameters,
                      rsiPeriod: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  과매수 기준
                </label>
                <input
                  type="number"
                  value={config.parameters.rsiOverbought || 70}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      parameters: {
                        ...config.parameters,
                        rsiOverbought: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  과매도 기준
                </label>
                <input
                  type="number"
                  value={config.parameters.rsiOversold || 30}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      parameters: {
                        ...config.parameters,
                        rsiOversold: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          백테스트 실행
        </Button>
      </form>
    </Card>
  );
}

