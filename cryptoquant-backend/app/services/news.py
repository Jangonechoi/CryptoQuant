"""
암호화폐 뉴스 서비스
외부 API를 통해 암호화폐 관련 뉴스를 가져옵니다.
한국어 뉴스를 우선적으로 가져오고, 없으면 영어 뉴스를 번역합니다.
"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random
from deep_translator import GoogleTranslator

# CryptoCompare News API (무료 버전)
CRYPTOCOMPARE_NEWS_URL = "https://min-api.cryptocompare.com/data/v2/news/"


def _translate_text(text: str, target_lang: str = "ko") -> str:
    """
    텍스트를 목표 언어로 번역
    
    Args:
        text: 번역할 텍스트
        target_lang: 목표 언어 코드 (기본값: "ko" - 한국어)
    
    Returns:
        번역된 텍스트
    """
    if not text or len(text.strip()) == 0:
        return text
    
    try:
        # 영어에서 한국어로 번역
        translator = GoogleTranslator(source="en", target=target_lang)
        translated = translator.translate(text)
        return translated
    except Exception as e:
        print(f"번역 오류: {str(e)}")
        # 번역 실패 시 원본 텍스트 반환
        return text


async def get_crypto_news(
    symbol: str, 
    limit: int = 10, 
    lang: str = "ko"
) -> List[Dict[str, Any]]:
    """
    암호화폐 관련 뉴스 조회
    
    Args:
        symbol: 암호화폐 심볼 (예: BTC, ETH)
        limit: 반환할 뉴스 개수
        lang: 원하는 언어 코드 ("ko": 한국어, "en": 영어, 기본값: "ko")
    
    Returns:
        뉴스 리스트 (지정된 언어로 번역됨)
    """
    # 심볼에서 base asset 추출 (BTCUSDT -> BTC)
    base_symbol = symbol.replace("USDT", "").replace("USD", "").upper()
    
    async with httpx.AsyncClient() as client:
        try:
            # 1단계: 한국어 뉴스 시도 (lang="KO" 또는 "KR")
            news_list = []
            if lang == "ko":
                try:
                    response = await client.get(
                        CRYPTOCOMPARE_NEWS_URL,
                        params={"lang": "KO"},
                        timeout=10.0,
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    if data.get("Type") == 100 and data.get("Data"):
                        all_news = data["Data"]
                        news_list = _filter_news_by_symbol(all_news, base_symbol, limit)
                except Exception as e:
                    print(f"한국어 뉴스 조회 실패: {str(e)}, 영어 뉴스로 대체")
            
            # 2단계: 한국어 뉴스가 없거나 부족하면 영어 뉴스 가져오기
            if not news_list or len(news_list) < limit:
                try:
                    response = await client.get(
                        CRYPTOCOMPARE_NEWS_URL,
                        params={"lang": "EN"},
                        timeout=10.0,
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    if data.get("Type") == 100 and data.get("Data"):
                        all_news = data["Data"]
                        english_news = _filter_news_by_symbol(all_news, base_symbol, limit)
                        
                        # 한국어 뉴스가 있으면 부족한 만큼만 영어 뉴스 추가
                        if news_list:
                            needed = limit - len(news_list)
                            english_news = english_news[:needed]
                        
                        # 영어 뉴스를 한국어로 번역
                        if lang == "ko":
                            for news in english_news:
                                news["title"] = _translate_text(news.get("title", ""))
                                news["body"] = _translate_text(news.get("body", ""))
                        
                        news_list.extend(english_news)
                except Exception as e:
                    print(f"영어 뉴스 조회 실패: {str(e)}")
            
            # 3단계: 뉴스가 없으면 mock 데이터 사용
            if not news_list:
                news_list = _get_mock_news(base_symbol, limit)
            
            # 최종적으로 limit 개수만큼만 반환
            news_list = news_list[:limit]
            
            # 데이터 형식 변환
            result = []
            for news in news_list:
                # 이미지 URL 처리
                image_url = news.get("imageurl") or news.get("imageUrl", "")
                if not image_url.startswith("http"):
                    image_url = f"https://www.cryptocompare.com{image_url}" if image_url else ""
                
                # 본문 길이 제한
                body = news.get("body", "")
                if len(body) > 200:
                    body = body[:200] + "..."
                
                result.append({
                    "id": news.get("id", ""),
                    "title": news.get("title", ""),
                    "body": body,
                    "url": news.get("url", ""),
                    "source": news.get("source", ""),
                    "imageUrl": image_url,
                    "publishedAt": news.get("published_on", news.get("publishedAt", 0)),
                    "tags": news.get("tags", "").split("|") if isinstance(news.get("tags"), str) else (news.get("tags", []) if isinstance(news.get("tags"), list) else []),
                    "categories": news.get("categories", "").split("|") if isinstance(news.get("categories"), str) else (news.get("categories", []) if isinstance(news.get("categories"), list) else []),
                })
            
            return result
                
        except Exception as e:
            # 에러 발생 시 mock 데이터 반환
            print(f"뉴스 API 오류: {str(e)}, mock 데이터 반환")
            return _get_mock_news(base_symbol, limit)


def _filter_news_by_symbol(
    all_news: List[Dict[str, Any]], 
    base_symbol: str, 
    limit: int
) -> List[Dict[str, Any]]:
    """
    특정 코인 관련 뉴스 필터링
    
    Args:
        all_news: 전체 뉴스 리스트
        base_symbol: 코인 심볼
        limit: 필요한 뉴스 개수
    
    Returns:
        필터링된 뉴스 리스트
    """
    filtered_news = []
    base_symbol_lower = base_symbol.lower()
    
    for news in all_news:
        title = news.get("title", "").lower()
        body = news.get("body", "").lower()
        tags = news.get("tags", "").lower() if isinstance(news.get("tags"), str) else ""
        categories = news.get("categories", "").lower() if isinstance(news.get("categories"), str) else ""
        
        # 제목, 본문, 태그, 카테고리에서 코인 이름 검색
        if (base_symbol_lower in title or 
            base_symbol_lower in body or 
            base_symbol_lower in tags or 
            base_symbol_lower in categories):
            filtered_news.append(news)
        
        # 충분한 뉴스를 찾으면 중단
        if len(filtered_news) >= limit * 2:  # 여유있게 가져오기
            break
    
    # 필터링된 뉴스가 없으면 전체 뉴스 사용
    if not filtered_news:
        filtered_news = all_news
    
    return filtered_news[:limit]


def _get_mock_news(symbol: str, limit: int) -> List[Dict[str, Any]]:
    """
    Mock 뉴스 데이터 생성 (API 실패 시 사용)
    """
    base_symbol = symbol.replace("USDT", "").replace("USD", "").upper()
    
    mock_titles = [
        f"{base_symbol} 가격이 급등하며 새로운 기록을 세웠습니다",
        f"{base_symbol} 채굴 난이도가 사상 최고치를 기록했습니다",
        f"주요 기관들이 {base_symbol} 투자에 관심을 보이고 있습니다",
        f"{base_symbol} 네트워크 업그레이드가 성공적으로 완료되었습니다",
        f"{base_symbol} 거래량이 전일 대비 30% 증가했습니다",
        f"글로벌 규제 기관이 {base_symbol} 관련 정책을 발표했습니다",
        f"{base_symbol} 생태계에 새로운 프로젝트가 런칭되었습니다",
        f"주요 거래소들이 {base_symbol} 상장을 발표했습니다",
        f"{base_symbol} 개발팀이 새로운 기능을 공개했습니다",
        f"분석가들이 {base_symbol} 전망을 긍정적으로 평가했습니다",
    ]
    
    mock_sources = [
        "CoinDesk",
        "CoinTelegraph",
        "CryptoNews",
        "Decrypt",
        "The Block",
        "Bloomberg Crypto",
    ]
    
    # 현재 시간부터 과거로 랜덤 시간 생성
    now = datetime.now()
    news_list = []
    
    for i in range(limit):
        hours_ago = random.randint(1, 72)  # 최근 72시간 내
        published_at = int((now - timedelta(hours=hours_ago)).timestamp())
        
        news_list.append({
            "id": f"mock_{base_symbol}_{i}_{published_at}",
            "title": random.choice(mock_titles),
            "body": f"{base_symbol}에 대한 최신 뉴스입니다. 시장 동향과 기술적 분석을 포함한 상세 정보를 제공합니다.",
            "url": f"https://example.com/news/{base_symbol.lower()}-{i}",
            "source": random.choice(mock_sources),
            "imageUrl": f"https://via.placeholder.com/400x200?text={base_symbol}+News",
            "publishedAt": published_at,
            "tags": [base_symbol, "crypto", "blockchain"],
            "categories": [base_symbol],
        })
    
    # 시간순 정렬 (최신순)
    news_list.sort(key=lambda x: x["publishedAt"], reverse=True)
    
    return news_list

