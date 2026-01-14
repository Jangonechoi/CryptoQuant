/**
 * 기간과 interval에 따라 적절한 limit 값을 계산합니다.
 * @param period - 선택된 기간 ("7d", "1M", "3M", "1Y", "MAX")
 * @param interval - 시간 간격 ("1m", "5m", "15m", "1h", "4h", "1d")
 * @returns 계산된 limit 값 (최대 1000)
 */
export function calculateLimitByPeriod(
  period: string,
  interval: string
): number {
  // interval별 하루당 캔들 수
  const candlesPerDay: Record<string, number> = {
    "1m": 1440, // 24시간 * 60분
    "5m": 288, // 24시간 * 12
    "15m": 96, // 24시간 * 4
    "1h": 24, // 24시간
    "4h": 6, // 24시간 / 4
    "1d": 1, // 1일
  };

  const candlesPerDayForInterval = candlesPerDay[interval] || 1;

  // 기간별 일수
  const daysByPeriod: Record<string, number> = {
    "7d": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
    MAX: 1000, // 최대는 Binance API 제한인 1000개
  };

  if (period === "MAX") {
    return 1000; // Binance API 최대 제한
  }

  const days = daysByPeriod[period] || 7;
  const calculatedLimit = days * candlesPerDayForInterval;

  // Binance API는 최대 1000개까지만 반환
  return Math.min(calculatedLimit, 1000);
}
