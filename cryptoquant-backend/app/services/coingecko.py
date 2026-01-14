"""
CoinGecko API 서비스
공개 API를 사용하여 시세 데이터를 가져옵니다.
"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime

COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"


async def get_coins_markets(
    vs_currency: str = "usd",
    order: str = "market_cap_desc",
    per_page: int = 250,
    page: int = 1,
    sparkline: bool = False,
    price_change_percentage: str = "24h",
) -> List[Dict[str, Any]]:
    """
    코인 시장 데이터 조회
    CoinGecko API의 /coins/markets 엔드포인트를 사용합니다.
    
    Args:
        vs_currency: 기준 통화 (기본값: "usd")
        order: 정렬 기준 (market_cap_desc, volume_desc, price_change_percentage_24h_desc 등)
        per_page: 페이지당 항목 수 (최대 250)
        page: 페이지 번호
        sparkline: 스파크라인 데이터 포함 여부
        price_change_percentage: 가격 변동률 기간 (24h, 7d, 30d 등)
    
    Returns:
        코인 시장 데이터 리스트
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{COINGECKO_BASE_URL}/coins/markets",
                params={
                    "vs_currency": vs_currency,
                    "order": order,
                    "per_page": min(per_page, 250),  # 최대 250개
                    "page": page,
                    "sparkline": str(sparkline).lower(),
                    "price_change_percentage": price_change_percentage,
                },
                timeout=15.0,
            )
            response.raise_for_status()
            data = response.json()
            
            # Binance 형식으로 변환
            result = []
            for coin in data:
                # CoinGecko symbol을 Binance 형식으로 변환 (예: bitcoin -> BTCUSDT)
                symbol = coin.get("symbol", "").upper() + "USDT"
                
                result.append({
                    "symbol": symbol,
                    "price": coin.get("current_price", 0.0),
                    "change24h": coin.get("price_change_24h", 0.0),
                    "changePercent24h": coin.get("price_change_percentage_24h", 0.0),
                    "volume24h": coin.get("total_volume", 0.0),
                    "high24h": coin.get("high_24h"),
                    "low24h": coin.get("low_24h"),
                    "marketCap": coin.get("market_cap"),
                    "marketCapRank": coin.get("market_cap_rank"),
                    "name": coin.get("name"),
                    "image": coin.get("image"),
                    "lastUpdated": coin.get("last_updated"),
                })
            
            return result
        except httpx.HTTPStatusError as e:
            raise Exception(f"CoinGecko API 오류: {e.response.status_code}")
        except Exception as e:
            raise Exception(f"데이터 조회 실패: {str(e)}")


async def get_top_gainers(
    vs_currency: str = "usd",
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    상위 상승 종목 조회
    거래량이 있는 코인 중 가격 상승률이 높은 코인들을 반환합니다.
    
    Args:
        vs_currency: 기준 통화 (기본값: "usd")
        limit: 반환할 코인 수 (기본값: 10)
    
    Returns:
        상위 상승 종목 리스트
    """
    try:
        # 가격 변동률 기준 내림차순 정렬
        # 더 많은 데이터를 가져와서 필터링 (상승 코인이 부족할 수 있음)
        markets = await get_coins_markets(
            vs_currency=vs_currency,
            order="price_change_percentage_24h_desc",
            per_page=min(limit * 3, 250),  # 최대 250개까지
            page=1,
        )
        
        # 상승 중인 코인만 필터링
        gainers = [
            coin for coin in markets
            if coin.get("changePercent24h", 0) > 0
        ]
        
        # 상승 코인이 부족한 경우, 상승률이 높은 코인들을 반환 (하락 중이어도)
        if len(gainers) < limit:
            # 전체 데이터를 상승률 기준으로 정렬하여 상위 limit개 반환
            markets_sorted = sorted(
                markets,
                key=lambda x: x.get("changePercent24h", 0),
                reverse=True
            )
            return markets_sorted[:limit]
        
        return gainers[:limit]
    except Exception as e:
        raise Exception(f"상위 상승 종목 조회 실패: {str(e)}")


async def get_top_volume(
    vs_currency: str = "usd",
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    거래량 상위 종목 조회
    
    Args:
        vs_currency: 기준 통화 (기본값: "usd")
        limit: 반환할 코인 수 (기본값: 10)
    
    Returns:
        거래량 상위 종목 리스트
    """
    try:
        # 거래량 기준 내림차순 정렬
        markets = await get_coins_markets(
            vs_currency=vs_currency,
            order="volume_desc",
            per_page=limit,
            page=1,
        )
        
        return markets[:limit]
    except Exception as e:
        raise Exception(f"거래량 상위 종목 조회 실패: {str(e)}")


async def get_new_listings(
    vs_currency: str = "usd",
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    신규 상장 코인 조회
    시가총액이 낮고 상대적으로 새로운 코인들을 반환합니다.
    
    참고: CoinGecko Pro API의 /coins/list/new 엔드포인트는 유료입니다.
    무료 플랜에서는 시가총액이 낮은 코인들을 신규 코인으로 간주합니다.
    
    Args:
        vs_currency: 기준 통화 (기본값: "usd")
        limit: 반환할 코인 수 (기본값: 10)
    
    Returns:
        신규 상장 코인 리스트
    """
    try:
        # 시가총액 기준 오름차순 정렬 (낮은 시가총액 = 신규 코인 가능성)
        markets = await get_coins_markets(
            vs_currency=vs_currency,
            order="market_cap_asc",
            per_page=limit * 3,  # 더 많은 데이터에서 필터링
            page=1,
        )
        
        # 상승 중이고 거래량이 있는 코인만 필터링
        new_coins = [
            coin for coin in markets
            if coin.get("changePercent24h", 0) > 0
            and coin.get("volume24h", 0) > 10000  # 최소 거래량 필터
        ]
        
        # 상승률 기준 정렬
        new_coins.sort(
            key=lambda x: x.get("changePercent24h", 0),
            reverse=True
        )
        
        return new_coins[:limit]
    except Exception as e:
        raise Exception(f"신규 상장 코인 조회 실패: {str(e)}")

