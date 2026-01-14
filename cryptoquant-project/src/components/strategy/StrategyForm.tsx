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
  strategyType:
    | "moving_average"
    | "rsi"
    | "macd"
    | "ema"
    | "volatility_breakout";
  initialCapital?: number;
  parameters: {
    shortPeriod?: number;
    longPeriod?: number;
    rsiPeriod?: number;
    rsiOverbought?: number;
    rsiOversold?: number;
    k?: number;
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
    initialCapital: 10000000, // 기본값 1천만원
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
    <Card className="h-full flex flex-col p-4">
      <h2 className="text-lg font-bold text-neutral-100 mb-2">전략 설정</h2>
      <form onSubmit={handleSubmit} className="space-y-2 flex-1">
        {/* 코인 선택 */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            암호화폐
          </label>
          <select
            value={config.symbol}
            onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
            className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="BNBUSDT">BNB/USDT</option>
          </select>
        </div>

        {/* 기간 선택 */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            시간 간격
          </label>
          <select
            value={config.interval}
            onChange={(e) => setConfig({ ...config, interval: e.target.value })}
            className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) =>
                setConfig({ ...config, startDate: e.target.value })
              }
              className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={config.endDate}
              onChange={(e) =>
                setConfig({ ...config, endDate: e.target.value })
              }
              className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 투자원금 */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            투자원금 (원)
          </label>
          <input
            type="text"
            value={
              config.initialCapital
                ? config.initialCapital.toLocaleString("ko-KR")
                : "10,000,000"
            }
            onChange={(e) => {
              // 콤마 제거 후 숫자로 변환
              const numericValue = e.target.value.replace(/,/g, "");
              const parsedValue =
                numericValue === "" ? 0 : parseFloat(numericValue);
              if (!isNaN(parsedValue) && parsedValue >= 0) {
                setConfig({
                  ...config,
                  initialCapital: parsedValue,
                });
              }
            }}
            onBlur={(e) => {
              // 포커스 해제 시 값이 없거나 0이면 기본값 설정
              const numericValue = e.target.value.replace(/,/g, "");
              const parsedValue =
                numericValue === "" ? 0 : parseFloat(numericValue);
              if (parsedValue === 0 || isNaN(parsedValue)) {
                setConfig({
                  ...config,
                  initialCapital: 10000000,
                });
              }
            }}
            className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="10,000,000"
          />
        </div>

        {/* 전략 타입 */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
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
            className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="moving_average">이동평균 전략</option>
            <option value="rsi">RSI 전략</option>
            <option value="macd">MACD 전략</option>
            <option value="ema">EMA 전략</option>
            <option value="volatility_breakout">변동성 돌파 전략</option>
          </select>
        </div>

        {/* 전략별 파라미터 */}
        {config.strategyType === "moving_average" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
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
                className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
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
                className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
          </div>
        )}

        {config.strategyType === "rsi" && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
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
                className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
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
                  className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
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
                  className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}

        {config.strategyType === "ema" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                단기 EMA
              </label>
              <input
                type="number"
                value={config.parameters.shortPeriod || 12}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    parameters: {
                      ...config.parameters,
                      shortPeriod: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                장기 EMA
              </label>
              <input
                type="number"
                value={config.parameters.longPeriod || 26}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    parameters: {
                      ...config.parameters,
                      longPeriod: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
          </div>
        )}

        {config.strategyType === "volatility_breakout" && (
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              변동성 계수 (k)
            </label>
            <input
              type="number"
              step="0.1"
              value={config.parameters.k ?? 0.5}
              onChange={(e) =>
                setConfig({
                  ...config,
                  parameters: {
                    ...config.parameters,
                    k: parseFloat(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-1.5 text-sm bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0.1"
              max="2.0"
            />
            <p className="text-xs text-neutral-400 mt-1">
              전일 종가 + (전일 변동성 × k) 기준선을 돌파하면 매수합니다. (권장:
              0.5)
            </p>
          </div>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-1.5 text-sm mt-2"
        >
          백테스트 실행
        </Button>
      </form>
    </Card>
  );
}
