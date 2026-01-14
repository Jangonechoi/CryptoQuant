"""
백테스팅 서비스
과거 데이터를 기반으로 전략의 성과를 시뮬레이션합니다.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import math


class BacktestEngine:
    """백테스팅 엔진"""
    
    def __init__(
        self,
        initial_capital: float = 10000.0,
        commission: float = 0.001,  # 0.1% 수수료
    ):
        self.initial_capital = initial_capital
        self.commission = commission
        self.equity = initial_capital
        self.position = 0.0  # 보유 수량
        self.trades = []
        self.equity_curve = []
        self.trade_signals = []
        
    def run(
        self,
        klines: List[Dict[str, Any]],
        strategy_type: str,
        parameters: Dict[str, Any],
        initial_capital: Optional[float] = None,
    ) -> Dict[str, Any]:
        """백테스트 실행"""
        if initial_capital is not None:
            self.initial_capital = initial_capital
        self.equity = self.initial_capital
        self.position = 0.0
        self.trades = []
        self.equity_curve = []
        self.trade_signals = []
        
        # 전략별 신호 생성
        signals = self._generate_signals(klines, strategy_type, parameters)
        
        # 신호 기반 거래 실행
        for i, signal in enumerate(signals):
            if signal["action"] == "buy" and self.position == 0:
                # 매수
                price = klines[i]["close"]
                cost = self.equity * (1 - self.commission)
                self.position = cost / price
                self.equity = 0
                self.trade_signals.append({
                    "time": klines[i]["time"],
                    "type": "buy",
                    "price": price,
                })
                self.trades.append({
                    "type": "buy",
                    "time": klines[i]["time"],
                    "price": price,
                    "quantity": self.position,
                })
            elif signal["action"] == "sell" and self.position > 0:
                # 매도
                price = klines[i]["close"]
                qty = self.position
                self.equity = qty * price * (1 - self.commission)
                self.position = 0.0
                self.trade_signals.append({
                    "time": klines[i]["time"],
                    "type": "sell",
                    "price": price,
                })
                self.trades.append({
                    "type": "sell",
                    "time": klines[i]["time"],
                    "price": price,
                    "quantity": qty,
                })
            
            # 자산 곡선 업데이트
            current_value = self.equity + (self.position * klines[i]["close"])
            self.equity_curve.append({
                "time": klines[i]["time"],
                "value": current_value,
            })
        
        # 최종 정산 (포지션이 남아있으면 마지막 가격으로 청산)
        if self.position > 0:
            final_time = klines[-1]["time"]
            final_price = klines[-1]["close"]
            qty = self.position
            self.equity = qty * final_price * (1 - self.commission)
            self.position = 0.0

            # 마지막 캔들에서 청산 거래/시그널 기록
            self.trade_signals.append({
                "time": final_time,
                "type": "sell",
                "price": final_price,
            })
            self.trades.append({
                "type": "sell",
                "time": final_time,
                "price": final_price,
                "quantity": qty,
            })

            # 커미션 반영된 최종 자산가치로 마지막 포인트 보정
            if self.equity_curve:
                self.equity_curve[-1]["value"] = self.equity
        
        # 성과 지표 계산
        metrics = self._calculate_metrics(klines)
        
        # 누적 수익률 곡선 계산
        cumulative_return_curve = self._calculate_cumulative_return_curve()
        
        # 월간 수익률 계산
        monthly_returns = self._calculate_monthly_returns()
        
        return {
            "initialCapital": self.initial_capital,
            "totalReturn": metrics["totalReturn"],
            "totalProfit": metrics["totalProfit"],
            "dailyAverageReturn": metrics["dailyAverageReturn"],
            "cumulativeReturn": metrics["totalReturn"],  # 누적 수익률은 totalReturn과 동일
            "cagr": metrics["cagr"],
            "totalTrades": metrics["totalTrades"],
            "winRate": metrics["winRate"],
            "maxDrawdown": metrics["maxDrawdown"],
            "sharpeRatio": metrics["sharpeRatio"],
            "chartData": klines,
            "equityCurve": self.equity_curve,
            "cumulativeReturnCurve": cumulative_return_curve,
            "monthlyReturns": monthly_returns,
            "tradeSignals": self.trade_signals,
        }
    
    def _generate_signals(
        self,
        klines: List[Dict[str, Any]],
        strategy_type: str,
        parameters: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """전략별 신호 생성"""
        if strategy_type == "moving_average":
            return self._moving_average_strategy(klines, parameters)
        elif strategy_type == "rsi":
            return self._rsi_strategy(klines, parameters)
        elif strategy_type == "macd":
            return self._macd_strategy(klines, parameters)
        elif strategy_type == "ema":
            return self._ema_strategy(klines, parameters)
        elif strategy_type == "volatility_breakout":
            return self._volatility_breakout_strategy(klines, parameters)
        else:
            return [{"action": "hold"} for _ in klines]
    
    def _moving_average_strategy(
        self,
        klines: List[Dict[str, Any]],
        parameters: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """이동평균 전략"""
        short_period = parameters.get("shortPeriod", 5)
        long_period = parameters.get("longPeriod", 20)
        
        signals = []
        short_ma = []
        long_ma = []
        
        for i in range(len(klines)):
            if i < long_period:
                signals.append({"action": "hold"})
                continue
            
            # 단기 이동평균
            short_slice = klines[i - short_period + 1 : i + 1]
            short_sum = sum(candle["close"] for candle in short_slice)
            short_ma.append(short_sum / short_period)
            
            # 장기 이동평균
            long_slice = klines[i - long_period + 1 : i + 1]
            long_sum = sum(candle["close"] for candle in long_slice)
            long_ma.append(long_sum / long_period)
            
            if len(short_ma) < 2:
                signals.append({"action": "hold"})
                continue
            
            # 골든 크로스: 단기 MA가 장기 MA를 상향 돌파
            if short_ma[-1] > long_ma[-1] and short_ma[-2] <= long_ma[-2]:
                signals.append({"action": "buy"})
            # 데드 크로스: 단기 MA가 장기 MA를 하향 돌파
            elif short_ma[-1] < long_ma[-1] and short_ma[-2] >= long_ma[-2]:
                signals.append({"action": "sell"})
            else:
                signals.append({"action": "hold"})
        
        return signals
    
    def _rsi_strategy(
        self,
        klines: List[Dict[str, Any]],
        parameters: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """RSI 전략"""
        period = parameters.get("rsiPeriod", 14)
        overbought = parameters.get("rsiOverbought", 70)
        oversold = parameters.get("rsiOversold", 30)
        
        signals = []
        rsi_values = []
        
        for i in range(len(klines)):
            if i < period:
                signals.append({"action": "hold"})
                continue
            
            # RSI 계산
            gains = []
            losses = []
            for j in range(i - period + 1, i + 1):
                change = klines[j]["close"] - klines[j - 1]["close"]
                if change > 0:
                    gains.append(change)
                    losses.append(0)
                else:
                    gains.append(0)
                    losses.append(abs(change))
            
            avg_gain = sum(gains) / period
            avg_loss = sum(losses) / period
            
            if avg_loss == 0:
                rsi = 100
            else:
                rs = avg_gain / avg_loss
                rsi = 100 - (100 / (1 + rs))
            
            rsi_values.append(rsi)
            
            if len(rsi_values) < 2:
                signals.append({"action": "hold"})
                continue
            
            # 과매도 구간에서 상승 전환 시 매수
            if rsi_values[-1] > oversold and rsi_values[-2] <= oversold:
                signals.append({"action": "buy"})
            # 과매수 구간에서 하락 전환 시 매도
            elif rsi_values[-1] < overbought and rsi_values[-2] >= overbought:
                signals.append({"action": "sell"})
            else:
                signals.append({"action": "hold"})
        
        return signals
    
    def _macd_strategy(
        self,
        klines: List[Dict[str, Any]],
        parameters: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """MACD 전략"""
        fast_period = parameters.get("fastPeriod", 12)
        slow_period = parameters.get("slowPeriod", 26)
        signal_period = parameters.get("signalPeriod", 9)
        
        signals = []
        ema_fast = []
        ema_slow = []
        macd_line = []
        signal_line = []
        
        for i in range(len(klines)):
            if i < slow_period:
                signals.append({"action": "hold"})
                continue
            
            # EMA 초기화 (SMA로 시작)
            if i == slow_period:
                # Fast EMA 초기화 (SMA)
                fast_slice = klines[i - fast_period + 1 : i + 1]
                fast_sma = sum(candle["close"] for candle in fast_slice) / fast_period
                ema_fast.append(fast_sma)
                # Slow EMA 초기화 (SMA)
                slow_slice = klines[i - slow_period + 1 : i + 1]
                slow_sma = sum(candle["close"] for candle in slow_slice) / slow_period
                ema_slow.append(slow_sma)
            else:
                # EMA 계산
                alpha_fast = 2 / (fast_period + 1)
                alpha_slow = 2 / (slow_period + 1)
                ema_fast.append(
                    alpha_fast * klines[i]["close"] + (1 - alpha_fast) * ema_fast[-1]
                )
                ema_slow.append(
                    alpha_slow * klines[i]["close"] + (1 - alpha_slow) * ema_slow[-1]
                )
            
            # MACD 라인
            if len(ema_fast) > 0 and len(ema_slow) > 0:
                macd = ema_fast[-1] - ema_slow[-1]
                macd_line.append(macd)
                
                # Signal 라인 (MACD의 EMA)
                if len(macd_line) == 1:
                    signal_line.append(macd)
                elif len(macd_line) >= signal_period:
                    alpha_signal = 2 / (signal_period + 1)
                    signal_line.append(
                        alpha_signal * macd + (1 - alpha_signal) * signal_line[-1]
                    )
                else:
                    # Signal 라인 초기화 (SMA)
                    signal_sma = sum(macd_line) / len(macd_line)
                    signal_line.append(signal_sma)
                
                # 신호 생성
                if len(macd_line) >= 2 and len(signal_line) >= 2:
                    # MACD가 Signal을 상향 돌파
                    if macd_line[-1] > signal_line[-1] and macd_line[-2] <= signal_line[-2]:
                        signals.append({"action": "buy"})
                    # MACD가 Signal을 하향 돌파
                    elif macd_line[-1] < signal_line[-1] and macd_line[-2] >= signal_line[-2]:
                        signals.append({"action": "sell"})
                    else:
                        signals.append({"action": "hold"})
                else:
                    signals.append({"action": "hold"})
            else:
                signals.append({"action": "hold"})
        
        return signals
    
    def _ema_strategy(
        self,
        klines: List[Dict[str, Any]],
        parameters: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """EMA 전략 (지수 이동평균 교차)"""
        short_period = parameters.get("shortPeriod", 12)
        long_period = parameters.get("longPeriod", 26)
        
        signals = []
        ema_short = []
        ema_long = []
        
        for i in range(len(klines)):
            if i < long_period:
                signals.append({"action": "hold"})
                continue
            
            # EMA 초기화 (SMA로 시작)
            if i == long_period:
                # 단기 EMA 초기화 (SMA)
                short_slice = klines[i - short_period + 1 : i + 1]
                short_sma = sum(candle["close"] for candle in short_slice) / short_period
                ema_short.append(short_sma)
                # 장기 EMA 초기화 (SMA)
                long_slice = klines[i - long_period + 1 : i + 1]
                long_sma = sum(candle["close"] for candle in long_slice) / long_period
                ema_long.append(long_sma)
            else:
                # EMA 계산
                alpha_short = 2 / (short_period + 1)
                alpha_long = 2 / (long_period + 1)
                ema_short.append(
                    alpha_short * klines[i]["close"] + (1 - alpha_short) * ema_short[-1]
                )
                ema_long.append(
                    alpha_long * klines[i]["close"] + (1 - alpha_long) * ema_long[-1]
                )
            
            # 신호 생성
            if len(ema_short) >= 2 and len(ema_long) >= 2:
                # 골든 크로스: 단기 EMA가 장기 EMA를 상향 돌파
                if ema_short[-1] > ema_long[-1] and ema_short[-2] <= ema_long[-2]:
                    signals.append({"action": "buy"})
                # 데드 크로스: 단기 EMA가 장기 EMA를 하향 돌파
                elif ema_short[-1] < ema_long[-1] and ema_short[-2] >= ema_long[-2]:
                    signals.append({"action": "sell"})
                else:
                    signals.append({"action": "hold"})
            else:
                signals.append({"action": "hold"})
        
        return signals
    
    def _volatility_breakout_strategy(
        self,
        klines: List[Dict[str, Any]],
        parameters: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """변동성 돌파 전략"""
        k = parameters.get("k", 0.5)  # 변동성 계수 (기본값 0.5)
        
        signals = []
        position_held = False  # 현재 포지션 보유 여부
        
        for i in range(len(klines)):
            if i < 1:
                # 첫 번째 캔들은 전일 데이터가 없으므로 hold
                signals.append({"action": "hold"})
                continue
            
            # 전일 데이터
            prev_high = klines[i - 1]["high"]
            prev_low = klines[i - 1]["low"]
            prev_close = klines[i - 1]["close"]
            
            # 변동성 계산 (전일 고가 - 전일 저가)
            volatility = prev_high - prev_low
            
            # 매수 기준선: 전일 종가 + (변동성 * k)
            buy_threshold = prev_close + (volatility * k)
            
            # 현재 가격
            current_price = klines[i]["close"]
            
            # 포지션이 없고 변동성 돌파 시 매수
            if not position_held and current_price > buy_threshold:
                signals.append({"action": "buy"})
                position_held = True
            # 포지션이 있으면 다음 캔들에서 매도
            elif position_held:
                signals.append({"action": "sell"})
                position_held = False
            else:
                signals.append({"action": "hold"})
        
        return signals
    
    def _calculate_metrics(self, klines: List[Dict[str, Any]]) -> Dict[str, float]:
        """성과 지표 계산"""
        if not self.equity_curve:
            return {
                "totalReturn": 0.0,
                "totalProfit": 0.0,
                "dailyAverageReturn": 0.0,
                "cagr": 0.0,
                "totalTrades": 0,
                "winRate": 0.0,
                "maxDrawdown": 0.0,
                "sharpeRatio": 0.0,
            }
        
        # 총 수익률 및 총 손익
        final_value = self.equity_curve[-1]["value"]
        total_return = ((final_value - self.initial_capital) / self.initial_capital) * 100
        total_profit = final_value - self.initial_capital
        
        # 일평균 수익률 계산
        if len(klines) > 0:
            start_time = klines[0]["time"]
            end_time = klines[-1]["time"]
            days = (end_time - start_time) / (24 * 60 * 60)  # 초를 일로 변환
            if days > 0:
                daily_average_return = total_return / days
            else:
                daily_average_return = 0.0
        else:
            daily_average_return = 0.0
        
        # CAGR 계산 (연환산 수익률)
        if len(klines) > 0:
            start_time = klines[0]["time"]
            end_time = klines[-1]["time"]
            years = (end_time - start_time) / (365.25 * 24 * 60 * 60)  # 초를 연으로 변환
            if years > 0 and final_value > 0:
                cagr = ((final_value / self.initial_capital) ** (1 / years) - 1) * 100
            else:
                cagr = 0.0
        else:
            cagr = 0.0
        
        # 총 거래 횟수
        total_trades = len([t for t in self.trades if t["type"] == "sell"])
        
        # 승률 계산
        if len(self.trades) < 2:
            win_rate = 0.0
        else:
            wins = 0
            for i in range(1, len(self.trades), 2):  # 매도 거래만 확인
                if i < len(self.trades):
                    sell_trade = self.trades[i]
                    buy_trade = self.trades[i - 1] if i > 0 else None
                    if buy_trade and sell_trade["price"] > buy_trade["price"]:
                        wins += 1
            win_rate = (wins / total_trades * 100) if total_trades > 0 else 0.0
        
        # 최대 낙폭 (MDD) - 절대값(+)로 반환
        peak = self.initial_capital
        max_drawdown = 0.0  # 음수로 누적
        for point in self.equity_curve:
            if point["value"] > peak:
                peak = point["value"]
            drawdown = ((point["value"] - peak) / peak) * 100
            if drawdown < max_drawdown:
                max_drawdown = drawdown
        max_drawdown_abs = abs(max_drawdown)
        
        # 샤프 지수 (간단한 버전)
        if len(self.equity_curve) < 2:
            sharpe_ratio = 0.0
        else:
            returns = []
            for i in range(1, len(self.equity_curve)):
                ret = (
                    (self.equity_curve[i]["value"] - self.equity_curve[i - 1]["value"])
                    / self.equity_curve[i - 1]["value"]
                )
                returns.append(ret)
            
            if returns:
                avg_return = sum(returns) / len(returns)
                std_return = math.sqrt(
                    sum((r - avg_return) ** 2 for r in returns) / len(returns)
                )
                sharpe_ratio = (avg_return / std_return * math.sqrt(252)) if std_return > 0 else 0.0
            else:
                sharpe_ratio = 0.0
        
        return {
            "totalReturn": round(total_return, 2),
            "totalProfit": round(total_profit, 2),
            "dailyAverageReturn": round(daily_average_return, 2),
            "cagr": round(cagr, 2),
            "totalTrades": total_trades,
            "winRate": round(win_rate, 2),
            "maxDrawdown": round(max_drawdown_abs, 2),
            "sharpeRatio": round(sharpe_ratio, 2),
        }
    
    def _calculate_cumulative_return_curve(self) -> List[Dict[str, Any]]:
        """누적 수익률 곡선 계산"""
        if not self.equity_curve:
            return []
        
        cumulative_return_curve = []
        for point in self.equity_curve:
            return_pct = ((point["value"] - self.initial_capital) / self.initial_capital) * 100
            cumulative_return_curve.append({
                "time": point["time"],
                "value": round(return_pct, 2),
            })
        
        return cumulative_return_curve
    
    def _calculate_monthly_returns(self) -> List[Dict[str, Any]]:
        """월간 수익률 계산"""
        if not self.equity_curve or len(self.equity_curve) < 2:
            return []
        
        monthly_returns = []
        monthly_data = {}  # {month_key: {"start_value": ..., "start_time": ..., "end_value": ..., "end_time": ...}}
        
        for point in self.equity_curve:
            dt = datetime.fromtimestamp(point["time"])
            month_key = f"{dt.year}-{dt.month:02d}"
            
            if month_key not in monthly_data:
                # 월의 첫 데이터 포인트
                monthly_data[month_key] = {
                    "start_value": point["value"],
                    "start_time": point["time"],
                    "end_value": point["value"],
                    "end_time": point["time"],
                }
            else:
                # 월의 마지막 데이터 포인트 업데이트
                monthly_data[month_key]["end_value"] = point["value"]
                monthly_data[month_key]["end_time"] = point["time"]
        
        # 월별 수익률 계산
        for month_key in sorted(monthly_data.keys()):
            month_info = monthly_data[month_key]
            if month_info["start_value"] > 0:
                monthly_return = (
                    (month_info["end_value"] - month_info["start_value"])
                    / month_info["start_value"]
                ) * 100
                monthly_returns.append({
                    "time": month_info["start_time"],
                    "value": round(monthly_return, 2),
                })
        
        return monthly_returns

