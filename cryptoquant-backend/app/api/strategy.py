from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.services.backtest import BacktestEngine
from app.services.binance import get_klines

router = APIRouter()


class TradeSignal(BaseModel):
    time: int
    type: str  # "buy" or "sell"
    price: float


class BacktestRequest(BaseModel):
    symbol: str
    interval: str
    startDate: str
    endDate: str
    strategyType: str
    parameters: Dict[str, Any]
    initialCapital: Optional[float] = 10000000.0  # 기본값 1천만원


class BacktestResponse(BaseModel):
    initialCapital: float
    totalReturn: float
    totalProfit: float
    dailyAverageReturn: float
    cumulativeReturn: float
    cagr: float
    totalTrades: int
    winRate: float
    maxDrawdown: float
    sharpeRatio: float
    chartData: Optional[List[Dict[str, Any]]] = None
    equityCurve: Optional[List[Dict[str, Any]]] = None
    cumulativeReturnCurve: Optional[List[Dict[str, Any]]] = None
    monthlyReturns: Optional[List[Dict[str, Any]]] = None
    tradeSignals: Optional[List[TradeSignal]] = None


@router.post("/backtest", response_model=BacktestResponse)
async def run_backtest(request: BacktestRequest):
    """
    백테스트 실행
    과거 데이터를 기반으로 전략의 성과를 시뮬레이션합니다.
    """
    try:
        # 날짜 범위 계산
        start_date = datetime.fromisoformat(request.startDate)
        end_date = datetime.fromisoformat(request.endDate)
        
        # 기간에 따른 limit 계산 (대략적으로)
        days_diff = (end_date - start_date).days
        interval_map = {
            "1m": 1440,  # 하루당 분 수
            "5m": 288,
            "15m": 96,
            "1h": 24,
            "4h": 6,
            "1d": 1,
        }
        limit = min(days_diff * interval_map.get(request.interval, 1), 1000)
        
        # Binance에서 과거 데이터 가져오기
        klines = await get_klines(
            symbol=request.symbol,
            interval=request.interval,
            limit=limit,
        )
        
        if not klines:
            raise HTTPException(
                status_code=404,
                detail="데이터를 가져올 수 없습니다. 심볼과 기간을 확인해주세요."
            )
        
        # 날짜 필터링 (Binance API는 최신 데이터부터 반환)
        filtered_klines = []
        start_timestamp = int(start_date.timestamp())
        end_timestamp = int(end_date.timestamp())
        
        for kline in klines:
            if start_timestamp <= kline["time"] <= end_timestamp:
                filtered_klines.append(kline)
        
        # 시간순 정렬
        filtered_klines.sort(key=lambda x: x["time"])
        
        if not filtered_klines:
            raise HTTPException(
                status_code=404,
                detail="선택한 기간에 해당하는 데이터가 없습니다."
            )
        
        # 백테스트 실행
        initial_capital = request.initialCapital if request.initialCapital else 10000000.0
        engine = BacktestEngine(initial_capital=initial_capital, commission=0.001)
        result = engine.run(
            klines=filtered_klines,
            strategy_type=request.strategyType,
            parameters=request.parameters,
            initial_capital=initial_capital,
        )
        
        return BacktestResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"백테스트 실행 중 오류 발생: {str(e)}")


@router.get("/history")
async def get_strategy_history():
    """
    전략 실행 이력 조회
    """
    return {
        "history": []
    }

