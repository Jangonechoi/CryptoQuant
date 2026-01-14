from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from app.services.binance import get_24h_ticker, get_klines, get_exchange_info, get_24h_tickers
from app.services.coingecko import get_top_gainers, get_top_volume, get_new_listings
from app.services.news import get_crypto_news
from app.services.social import get_reddit_posts, get_twitter_posts

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


@router.get("/prices")
async def get_market_prices(
    symbols: Optional[List[str]] = Query(None, description="조회할 심볼 목록 (없으면 인기 코인 반환)"),
    all_coins: bool = Query(False, description="모든 USDT 페어 조회 (최대 200개)"),
):
    """
    여러 암호화폐의 시세를 한 번에 조회
    symbols 파라미터가 없으면 인기 코인들을 반환합니다.
    all_coins=True이면 모든 USDT 페어를 조회합니다 (최대 200개).
    """
    try:
        # all_coins가 True이면 모든 USDT 페어 조회
        if all_coins:
            tickers = await get_24h_tickers(None)
            # 상위 200개만 반환 (성능 고려)
            tickers = tickers[:200]
        # symbols가 없으면 인기 코인 목록 사용
        elif not symbols:
            popular_symbols = [
                "BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "SOLUSDT",
                "USDCUSDT", "DOGEUSDT", "TRXUSDT", "ADAUSDT", "AVAXUSDT",
                "MATICUSDT", "DOTUSDT", "LINKUSDT", "UNIUSDT", "LTCUSDT",
                "ATOMUSDT", "ETCUSDT", "XLMUSDT", "ALGOUSDT", "NEARUSDT",
                "FILUSDT", "ICPUSDT", "APTUSDT", "ARBUSDT", "OPUSDT",
            ]
            tickers = await get_24h_tickers(popular_symbols)
        else:
            tickers = await get_24h_tickers(symbols)
        
        return {"prices": tickers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/klines")
async def get_klines_endpoint(
    symbol: str,
    interval: str = "1d",
    limit: int = 100,
    start_time: Optional[int] = Query(None, description="시작 시간 (Unix timestamp, 초 단위)"),
):
    """
    캔들스틱 데이터 조회
    Binance API를 통해 과거 가격 데이터를 가져옵니다.
    start_time이 제공되면 해당 시간 이전의 데이터를 가져옵니다.
    """
    try:
        from app.services.binance import get_klines as fetch_klines
        klines = await fetch_klines(symbol, interval, limit, start_time)
        return {
            "symbol": symbol,
            "interval": interval,
            "data": klines,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class NewsItem(BaseModel):
    id: str
    title: str
    body: str
    url: str
    source: str
    imageUrl: Optional[str] = None
    publishedAt: int
    tags: List[str] = []
    categories: List[str] = []


class NewsResponse(BaseModel):
    symbol: str
    news: List[NewsItem]


@router.get("/news", response_model=NewsResponse)
async def get_news(
    symbol: str,
    limit: int = Query(10, ge=1, le=50, description="반환할 뉴스 개수"),
    lang: str = Query("ko", description="언어 코드 (ko: 한국어, en: 영어)"),
):
    """
    암호화폐 관련 뉴스 조회
    특정 암호화폐에 대한 최신 뉴스를 가져옵니다.
    한국어 뉴스를 우선적으로 가져오고, 없으면 영어 뉴스를 번역합니다.
    """
    try:
        news_list = await get_crypto_news(symbol, limit, lang)
        return NewsResponse(
            symbol=symbol,
            news=news_list,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SocialPost(BaseModel):
    id: str
    title: str
    body: str
    url: str
    source: str
    author: Optional[str] = None
    upvotes: Optional[int] = None
    likes: Optional[int] = None
    retweets: Optional[int] = None
    comments: Optional[int] = None
    publishedAt: int
    type: str  # "reddit" or "twitter"


class SocialResponse(BaseModel):
    symbol: str
    reddit: List[SocialPost]
    twitter: List[SocialPost]


@router.get("/social", response_model=SocialResponse)
async def get_social_posts(
    symbol: str,
    limit: int = Query(10, ge=1, le=20, description="각 플랫폼당 반환할 게시물 개수"),
):
    """
    소셜 미디어 게시물 조회
    Reddit과 Twitter/X에서 특정 암호화폐 관련 게시물을 가져옵니다.
    """
    try:
        reddit_posts = await get_reddit_posts(symbol, limit)
        twitter_posts = await get_twitter_posts(symbol, limit)
        
        return SocialResponse(
            symbol=symbol,
            reddit=reddit_posts,
            twitter=twitter_posts,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# CoinGecko API 기반 엔드포인트
@router.get("/top-gainers")
async def get_top_gainers_endpoint(
    limit: int = Query(10, ge=1, le=30, description="반환할 코인 수"),
):
    """
    최근 24시간 상위 상승 종목 조회
    CoinGecko API를 사용하여 가격 상승률이 높은 코인들을 반환합니다.
    """
    try:
        gainers = await get_top_gainers(limit=limit)
        return {"prices": gainers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-volume")
async def get_top_volume_endpoint(
    limit: int = Query(10, ge=1, le=30, description="반환할 코인 수"),
):
    """
    거래량 상위 종목 조회
    CoinGecko API를 사용하여 24시간 거래량이 높은 코인들을 반환합니다.
    """
    try:
        volume_coins = await get_top_volume(limit=limit)
        return {"prices": volume_coins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/new-listings")
async def get_new_listings_endpoint(
    limit: int = Query(10, ge=1, le=30, description="반환할 코인 수"),
):
    """
    신규 상장 코인 조회
    CoinGecko API를 사용하여 상대적으로 새로운 코인들을 반환합니다.
    무료 플랜에서는 시가총액이 낮고 상승 중인 코인들을 신규 코인으로 간주합니다.
    """
    try:
        new_coins = await get_new_listings(limit=limit)
        return {"prices": new_coins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

