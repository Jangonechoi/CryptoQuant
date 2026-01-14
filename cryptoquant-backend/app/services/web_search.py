"""
웹 검색 서비스
Google Custom Search API를 사용하여 웹 검색 결과를 가져옵니다.
"""
import httpx
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import os

load_dotenv()

# Google Custom Search API 설정
GOOGLE_SEARCH_API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
GOOGLE_SEARCH_ENGINE_ID = os.getenv("GOOGLE_SEARCH_ENGINE_ID")

GOOGLE_SEARCH_BASE_URL = "https://www.googleapis.com/customsearch/v1"


async def search_web(
    query: str,
    num_results: int = 5,
    lang: str = "ko"
) -> List[Dict[str, Any]]:
    """
    Google Custom Search API를 사용하여 웹 검색 수행
    
    Args:
        query: 검색 쿼리
        num_results: 반환할 결과 개수 (최대 10)
        lang: 검색 언어 (기본값: "ko" - 한국어)
    
    Returns:
        검색 결과 리스트
    """
    if not GOOGLE_SEARCH_API_KEY or not GOOGLE_SEARCH_ENGINE_ID:
        # API 키가 없으면 빈 리스트 반환
        return []
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GOOGLE_SEARCH_BASE_URL,
                params={
                    "key": GOOGLE_SEARCH_API_KEY,
                    "cx": GOOGLE_SEARCH_ENGINE_ID,
                    "q": query,
                    "num": min(num_results, 10),  # 최대 10개
                    "lr": f"lang_{lang}",  # 언어 설정
                },
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()
            
            results = []
            items = data.get("items", [])
            
            for item in items[:num_results]:
                results.append({
                    "title": item.get("title", ""),
                    "snippet": item.get("snippet", ""),
                    "link": item.get("link", ""),
                    "displayLink": item.get("displayLink", ""),
                })
            
            return results
    except httpx.HTTPStatusError as e:
        # API 오류 시 빈 리스트 반환 (서비스 중단 방지)
        print(f"Google Search API 오류: {e.response.status_code}")
        return []
    except Exception as e:
        print(f"웹 검색 오류: {str(e)}")
        return []


def format_search_results_for_context(search_results: List[Dict[str, Any]]) -> str:
    """
    검색 결과를 Gemini에게 전달할 수 있는 형식으로 포맷팅
    
    Args:
        search_results: 검색 결과 리스트
    
    Returns:
        포맷팅된 검색 결과 문자열
    """
    if not search_results:
        return ""
    
    formatted = "\n[웹 검색 결과]\n\n"
    for i, result in enumerate(search_results, 1):
        title = result.get("title", "")
        snippet = result.get("snippet", "")
        link = result.get("link", "")
        display_link = result.get("displayLink", "")
        
        formatted += f"{i}. {title}\n"
        if snippet:
            formatted += f"   {snippet}\n"
        if link:
            formatted += f"   출처: {display_link or link}\n"
            formatted += f"   링크: {link}\n"
        formatted += "\n"
    
    return formatted

