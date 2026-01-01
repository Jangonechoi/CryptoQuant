from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.binance import get_24h_ticker, get_klines, get_exchange_info

router = APIRouter()


class MarketPriceResponse(BaseModel):
    symbol: str
    price: float
    change24h: float
    changePercent24h: float
    volume24h: float
    high24h: Optional[float] = None
    low24h: Optional[float] = None


@router.get("/price", response_model=MarketPriceResponse)
async def get_market_price(
    symbol: str,
    interval: str = "1d",
):
    """
    암호화폐 시세 조회
    Binance API를 통해 실시간 시세 데이터를 가져옵니다.
    """
    try:
        data = await get_24h_ticker(symbol)
        return MarketPriceResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/coins")
async def get_coin_list():
    """
    지원하는 코인 목록 조회
    Binance에서 거래 가능한 USDT 페어를 가져옵니다.
    """
    try:
        coins = await get_exchange_info()
        return {"coins": coins}
    except Exception as e:
        # 실패 시 기본 목록 반환
        return {
            "coins": [
                {"symbol": "BTCUSDT", "name": "Bitcoin", "base": "BTC", "quote": "USDT"},
                {"symbol": "ETHUSDT", "name": "Ethereum", "base": "ETH", "quote": "USDT"},
                {"symbol": "BNBUSDT", "name": "Binance Coin", "base": "BNB", "quote": "USDT"},
            ]
        }


@router.get("/klines")
async def get_klines_endpoint(
    symbol: str,
    interval: str = "1d",
    limit: int = 100,
):
    """
    캔들스틱 데이터 조회
    Binance API를 통해 과거 가격 데이터를 가져옵니다.
    """
    try:
        from app.services.binance import get_klines as fetch_klines
        klines = await fetch_klines(symbol, interval, limit)
        return {
            "symbol": symbol,
            "interval": interval,
            "data": klines,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

