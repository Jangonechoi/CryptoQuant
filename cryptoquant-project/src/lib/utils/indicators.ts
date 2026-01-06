/**
 * 기술적 지표 계산 유틸리티 함수
 */

export interface PriceData {
  time: number;
  close: number;
  high?: number;
  low?: number;
}

/**
 * SMA (Simple Moving Average) - 단순 이동평균
 * @param data 가격 데이터 배열
 * @param period 기간 (예: 20, 50)
 * @returns SMA 값 배열
 */
export function calculateSMA(
  data: PriceData[],
  period: number
): Array<{ time: number; value: number }> {
  if (data.length < period) {
    return [];
  }

  const result: Array<{ time: number; value: number }> = [];

  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, item) => acc + item.close, 0);
    const average = sum / period;

    result.push({
      time: data[i].time,
      value: average,
    });
  }

  return result;
}

/**
 * EMA (Exponential Moving Average) - 지수 이동평균
 * @param data 가격 데이터 배열
 * @param period 기간 (예: 20, 50)
 * @returns EMA 값 배열
 */
export function calculateEMA(
  data: PriceData[],
  period: number
): Array<{ time: number; value: number }> {
  if (data.length < period) {
    return [];
  }

  const result: Array<{ time: number; value: number }> = [];
  const multiplier = 2 / (period + 1);

  // 첫 EMA는 SMA로 시작
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += data[i].close;
  }
  ema = ema / period;
  result.push({ time: data[period - 1].time, value: ema });

  // 이후 EMA 계산
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: ema });
  }

  return result;
}

/**
 * RSI (Relative Strength Index) - 상대강도지수
 * @param data 가격 데이터 배열
 * @param period 기간 (기본값: 14)
 * @returns RSI 값 배열 (0-100)
 */
export function calculateRSI(
  data: PriceData[],
  period: number = 14
): Array<{ time: number; value: number }> {
  if (data.length < period + 1) {
    return [];
  }

  const result: Array<{ time: number; value: number }> = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // 초기 변화량 계산
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // 첫 RSI 계산 (SMA 사용)
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }

  avgGain = avgGain / period;
  avgLoss = avgLoss / period;

  // 첫 RSI 값
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  result.push({ time: data[period].time, value: rsi });

  // 이후 RSI 계산 (EMA 사용)
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    result.push({ time: data[i + 1].time, value: rsi });
  }

  return result;
}
