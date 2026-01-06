"""
Binance API 서비스
공개 API를 사용하여 시세 데이터를 가져옵니다.
"""
import httpx
from typing import List, Dict, Any
from datetime import datetime

BINANCE_BASE_URL = "https://api.binance.com/api/v3"


async def get_24h_ticker(symbol: str) -> Dict[str, Any]:
    """
    24시간 티커 정보 조회
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BINANCE_BASE_URL}/ticker/24hr",
                params={"symbol": symbol.upper()},
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "symbol": data["symbol"],
                "price": float(data["lastPrice"]),
                "change24h": float(data["priceChange"]),
                "changePercent24h": float(data["priceChangePercent"]),
                "volume24h": float(data["volume"]),
                "high24h": float(data["highPrice"]),
                "low24h": float(data["lowPrice"]),
            }
        except httpx.HTTPStatusError as e:
            raise Exception(f"Binance API 오류: {e.response.status_code}")
        except Exception as e:
            raise Exception(f"데이터 조회 실패: {str(e)}")


async def get_24h_tickers(symbols: List[str] = None) -> List[Dict[str, Any]]:
    """
    여러 코인의 24시간 티커 정보를 한 번에 조회
    symbols가 None이면 모든 USDT 페어를 반환
    """
    async with httpx.AsyncClient() as client:
        try:
            # Binance API는 심볼 없이 호출하면 모든 티커를 반환
            response = await client.get(
                f"{BINANCE_BASE_URL}/ticker/24hr",
                timeout=15.0,
            )
            response.raise_for_status()
            all_tickers = response.json()
            
            # USDT 페어만 필터링
            usdt_tickers = [
                ticker for ticker in all_tickers
                if ticker["symbol"].endswith("USDT")
            ]
            
            # 특정 심볼만 요청한 경우 필터링
            if symbols:
                symbol_set = {s.upper() for s in symbols}
                usdt_tickers = [
                    ticker for ticker in usdt_tickers
                    if ticker["symbol"] in symbol_set
                ]
            
            # 데이터 형식 변환
            result = []
            for ticker in usdt_tickers:
                result.append({
                    "symbol": ticker["symbol"],
                    "price": float(ticker["lastPrice"]),
                    "change24h": float(ticker["priceChange"]),
                    "changePercent24h": float(ticker["priceChangePercent"]),
                    "volume24h": float(ticker["volume"]),
                    "high24h": float(ticker["highPrice"]),
                    "low24h": float(ticker["lowPrice"]),
                })
            
            return result
        except httpx.HTTPStatusError as e:
            raise Exception(f"Binance API 오류: {e.response.status_code}")
        except Exception as e:
            raise Exception(f"데이터 조회 실패: {str(e)}")


async def get_klines(
    symbol: str, interval: str = "1d", limit: int = 100
) -> List[Dict[str, Any]]:
    """
    캔들스틱 데이터 조회
    
    interval: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
    """
    # Binance interval 매핑
    interval_map = {
        "1m": "1m",
        "5m": "5m",
        "15m": "15m",
        "1h": "1h",
        "4h": "4h",
        "1d": "1d",
    }
    
    binance_interval = interval_map.get(interval, "1d")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BINANCE_BASE_URL}/klines",
                params={
                    "symbol": symbol.upper(),
                    "interval": binance_interval,
                    "limit": min(limit, 1000),  # Binance 최대 제한
                },
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()
            
            # Binance klines 형식을 변환
            # [timestamp, open, high, low, close, volume, ...]
            klines = []
            for kline in data:
                klines.append({
                    "time": int(kline[0]) // 1000,  # 밀리초를 초로 변환
                    "open": float(kline[1]),
                    "high": float(kline[2]),
                    "low": float(kline[3]),
                    "close": float(kline[4]),
                    "volume": float(kline[5]),
                })
            
            return klines
        except httpx.HTTPStatusError as e:
            raise Exception(f"Binance API 오류: {e.response.status_code}")
        except Exception as e:
            raise Exception(f"데이터 조회 실패: {str(e)}")


async def get_exchange_info() -> List[Dict[str, Any]]:
    """
    거래 가능한 심볼 목록 조회
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BINANCE_BASE_URL}/exchangeInfo",
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()
            
            # USDT 페어만 필터링
            symbols = []
            for symbol_info in data.get("symbols", []):
                if symbol_info["quoteAsset"] == "USDT" and symbol_info["status"] == "TRADING":
                    symbols.append({
                        "symbol": symbol_info["symbol"],
                        "baseAsset": symbol_info["baseAsset"],
                        "quoteAsset": symbol_info["quoteAsset"],
                        "name": symbol_info["baseAsset"],
                    })
            
            return symbols[:50]  # 상위 50개만 반환
        except Exception as e:
            raise Exception(f"심볼 목록 조회 실패: {str(e)}")

