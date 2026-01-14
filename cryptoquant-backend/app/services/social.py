"""
소셜 미디어 서비스
Reddit과 Twitter/X에서 암호화폐 관련 게시물을 가져옵니다.
"""
import httpx
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random
import re

# Reddit API (공개 API, 인증 불필요)
REDDIT_BASE_URL = "https://www.reddit.com/r"


async def get_reddit_posts(symbol: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Reddit에서 암호화폐 관련 게시물 조회
    
    Args:
        symbol: 암호화폐 심볼 (예: BTC, ETH)
        limit: 반환할 게시물 개수
    
    Returns:
        Reddit 게시물 리스트
    """
    base_symbol = symbol.replace("USDT", "").replace("USD", "").upper()
    base_symbol_lower = base_symbol.lower()
    
    # 관련 서브레딧 목록
    subreddits = [
        "cryptocurrency",
        "Bitcoin",
        "ethereum",
        "CryptoCurrency",
        "CryptoMarkets",
        "altcoin",
    ]
    
    async with httpx.AsyncClient() as client:
        try:
            all_posts = []
            
            # 여러 서브레딧에서 검색
            for subreddit in subreddits[:3]:  # 상위 3개만 검색
                try:
                    # Reddit 검색 API 사용
                    response = await client.get(
                        f"{REDDIT_BASE_URL}/{subreddit}/search.json",
                        params={
                            "q": base_symbol,
                            "sort": "new",
                            "limit": limit,
                            "restrict_sr": "1",  # 해당 서브레딧만 검색
                        },
                        headers={
                            "User-Agent": "CryptoQuant/1.0 (Educational Purpose)",
                        },
                        timeout=10.0,
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if "data" in data and "children" in data["data"]:
                            for child in data["data"]["children"]:
                                post = child.get("data", {})
                                # 제목이나 본문에 심볼이 포함된 경우만 추가
                                title = post.get("title", "").lower()
                                selftext = post.get("selftext", "").lower()
                                
                                if (base_symbol_lower in title or 
                                    base_symbol_lower in selftext or
                                    base_symbol_lower in post.get("subreddit", "").lower()):
                                    all_posts.append({
                                        "id": f"reddit_{post.get('id', '')}",
                                        "title": post.get("title", ""),
                                        "body": post.get("selftext", "")[:300] + "..." if len(post.get("selftext", "")) > 300 else post.get("selftext", ""),
                                        "url": f"https://www.reddit.com{post.get('permalink', '')}",
                                        "source": f"r/{post.get('subreddit', 'cryptocurrency')}",
                                        "author": post.get("author", ""),
                                        "upvotes": post.get("ups", 0),
                                        "comments": post.get("num_comments", 0),
                                        "publishedAt": int(post.get("created_utc", 0)),
                                        "type": "reddit",
                                    })
                except Exception as e:
                    print(f"Reddit 서브레딧 {subreddit} 조회 실패: {str(e)}")
                    continue
            
            # 중복 제거 및 정렬
            seen_ids = set()
            unique_posts = []
            for post in all_posts:
                if post["id"] not in seen_ids:
                    seen_ids.add(post["id"])
                    unique_posts.append(post)
            
            # 시간순 정렬 (최신순)
            unique_posts.sort(key=lambda x: x["publishedAt"], reverse=True)
            
            return unique_posts[:limit]
            
        except Exception as e:
            print(f"Reddit API 오류: {str(e)}, mock 데이터 반환")
            return _get_mock_reddit_posts(base_symbol, limit)


async def get_twitter_posts(symbol: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Twitter/X에서 암호화폐 관련 게시물 조회
    
    Note: Twitter API는 유료이므로, 공개 RSS 피드나 mock 데이터를 사용합니다.
    실제 프로덕션에서는 Twitter API v2를 사용하거나 다른 소스를 활용해야 합니다.
    
    Args:
        symbol: 암호화폐 심볼 (예: BTC, ETH)
        limit: 반환할 게시물 개수
    
    Returns:
        Twitter 게시물 리스트
    """
    base_symbol = symbol.replace("USDT", "").replace("USD", "").upper()
    
    # Twitter API는 유료이므로, 현재는 mock 데이터 반환
    # 실제 구현 시 Twitter API v2 또는 공개 RSS 피드 사용
    return _get_mock_twitter_posts(base_symbol, limit)


def _get_mock_reddit_posts(symbol: str, limit: int) -> List[Dict[str, Any]]:
    """
    Mock Reddit 게시물 데이터 생성
    """
    base_symbol = symbol.replace("USDT", "").replace("USD", "").upper()
    
    mock_titles = [
        f"🚀 {base_symbol}가 다시 상승세를 보이고 있습니다!",
        f"{base_symbol}에 대한 여러분의 생각은?",
        f"{base_symbol} 기술적 분석 - 이번 주 전망",
        f"{base_symbol} 홀더분들, 어떻게 생각하시나요?",
        f"{base_symbol} 관련 최신 뉴스 정리",
        f"{base_symbol} 가격 예측 토론",
        f"{base_symbol} vs 다른 알트코인 비교",
        f"{base_symbol} 네트워크 활동이 활발해지고 있습니다",
    ]
    
    mock_subreddits = [
        "cryptocurrency",
        "Bitcoin",
        "CryptoMarkets",
        "altcoin",
    ]
    
    now = datetime.now()
    posts = []
    
    for i in range(limit):
        hours_ago = random.randint(1, 48)
        published_at = int((now - timedelta(hours=hours_ago)).timestamp())
        
        posts.append({
            "id": f"mock_reddit_{base_symbol}_{i}_{published_at}",
            "title": random.choice(mock_titles),
            "body": f"{base_symbol}에 대한 커뮤니티 토론입니다. 다양한 의견과 분석을 공유하고 있습니다.",
            "url": f"https://www.reddit.com/r/cryptocurrency/comments/mock_{i}",
            "source": f"r/{random.choice(mock_subreddits)}",
            "author": f"user_{random.randint(1000, 9999)}",
            "upvotes": random.randint(10, 500),
            "comments": random.randint(5, 100),
            "publishedAt": published_at,
            "type": "reddit",
        })
    
    posts.sort(key=lambda x: x["publishedAt"], reverse=True)
    return posts


def _get_mock_twitter_posts(symbol: str, limit: int) -> List[Dict[str, Any]]:
    """
    Mock Twitter/X 게시물 데이터 생성
    """
    base_symbol = symbol.replace("USDT", "").replace("USD", "").upper()
    
    mock_tweets = [
        f"#{base_symbol} is showing strong momentum today! 📈",
        f"Interesting analysis on {base_symbol} price action. What do you think?",
        f"{base_symbol} breaking key resistance levels 🚀",
        f"Just bought more {base_symbol}. Long term holder here 💎",
        f"{base_symbol} community is growing! Great to see adoption increasing.",
        f"Technical analysis: {base_symbol} looks bullish for the week ahead.",
        f"{base_symbol} fundamentals remain strong despite market volatility.",
        f"New {base_symbol} developments are exciting! The future looks bright.",
    ]
    
    mock_users = [
        "CryptoAnalyst",
        "BlockchainNews",
        "CryptoTrader",
        "DeFiInvestor",
        "CryptoWhale",
    ]
    
    now = datetime.now()
    tweets = []
    
    for i in range(limit):
        hours_ago = random.randint(1, 24)
        published_at = int((now - timedelta(hours=hours_ago)).timestamp())
        
        tweets.append({
            "id": f"mock_twitter_{base_symbol}_{i}_{published_at}",
            "title": random.choice(mock_tweets),
            "body": "",
            "url": f"https://twitter.com/user/status/mock_{i}",
            "source": f"@{random.choice(mock_users)}",
            "author": random.choice(mock_users),
            "likes": random.randint(10, 1000),
            "retweets": random.randint(5, 200),
            "publishedAt": published_at,
            "type": "twitter",
        })
    
    tweets.sort(key=lambda x: x["publishedAt"], reverse=True)
    return tweets

