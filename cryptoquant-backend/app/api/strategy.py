from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter()


class BacktestRequest(BaseModel):
    symbol: str
    interval: str
    startDate: str
    endDate: str
    strategyType: str
    parameters: Dict[str, Any]


class BacktestResponse(BaseModel):
    totalReturn: float
    totalTrades: int
    winRate: float
    maxDrawdown: float
    sharpeRatio: float
    chartData: Optional[list] = None
    equityCurve: Optional[list] = None


@router.post("/backtest", response_model=BacktestResponse)
async def run_backtest(request: BacktestRequest):
    """
    백테스트 실행
    과거 데이터를 기반으로 전략의 성과를 시뮬레이션합니다.
    """
    try:
        # 실제 백테스트 로직 구현 예정
        # 현재는 목업 데이터 반환
        return {
            "totalReturn": 15.5,
            "totalTrades": 42,
            "winRate": 65.5,
            "maxDrawdown": -8.2,
            "sharpeRatio": 1.8,
            "chartData": [],
            "equityCurve": [],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_strategy_history():
    """
    전략 실행 이력 조회
    """
    return {
        "history": []
    }

