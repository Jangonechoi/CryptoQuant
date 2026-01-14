from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from app.services.gemini import chat_with_gemini
from app.api.auth import verify_jwt_token
from app.services.news import get_crypto_news
from app.services.web_search import search_web, format_search_results_for_context

router = APIRouter()
security = HTTPBearer()


class ChatRequest(BaseModel):
    message: str
    previous_interaction_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    interaction_id: str


async def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    JWT 토큰에서 현재 사용자 정보 추출
    """
    token = credentials.credentials
    payload = verify_jwt_token(token)
    return payload


def _is_news_related(message: str) -> bool:
    """
    메시지가 뉴스 관련 질문인지 확인
    
    Args:
        message: 사용자 메시지
    
    Returns:
        뉴스 관련 질문이면 True
    """
    news_keywords = [
        "뉴스", "news", "기사", "최신", "최근", "소식", "이슈", 
        "발생", "발표", "공개", "업데이트", "트렌드", "동향"
    ]
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in news_keywords)


def _extract_crypto_symbol(message: str) -> Optional[str]:
    """
    메시지에서 암호화폐 심볼 추출
    
    Args:
        message: 사용자 메시지
    
    Returns:
        추출된 심볼 (없으면 None)
    """
    # 주요 암호화폐 심볼 패턴
    crypto_symbols = [
        "BTC", "ETH", "BNB", "SOL", "ADA", "XRP", "DOGE", "DOT", 
        "MATIC", "AVAX", "LINK", "UNI", "ATOM", "ETC", "LTC", "BCH",
        "비트코인", "이더리움", "솔라나", "에이다", "리플", "도지코인"
    ]
    
    message_upper = message.upper()
    for symbol in crypto_symbols:
        if symbol in message_upper or symbol in message:
            # 한국어 이름을 심볼로 변환
            name_to_symbol = {
                "비트코인": "BTC",
                "이더리움": "ETH",
                "솔라나": "SOL",
                "에이다": "ADA",
                "리플": "XRP",
                "도지코인": "DOGE"
            }
            return name_to_symbol.get(symbol, symbol)
    
    return None


def _format_news_for_context(news_list: list) -> str:
    """
    뉴스 리스트를 Gemini에게 전달할 수 있는 형식으로 포맷팅
    
    Args:
        news_list: 뉴스 리스트
    
    Returns:
        포맷팅된 뉴스 문자열
    """
    if not news_list:
        return "최신 뉴스 정보를 찾을 수 없습니다."
    
    formatted_news = "\n[최신 암호화폐 뉴스]\n\n"
    for i, news in enumerate(news_list[:5], 1):  # 최대 5개만
        title = news.get("title", "")
        body = news.get("body", "")
        source = news.get("source", "")
        url = news.get("url", "")
        published_at = news.get("publishedAt", 0)
        
        formatted_news += f"{i}. {title}\n"
        if body:
            formatted_news += f"   내용: {body}\n"
        if source:
            formatted_news += f"   출처: {source}\n"
        if url:
            formatted_news += f"   링크: {url}\n"
        formatted_news += "\n"
    
    return formatted_news


def _needs_web_search(message: str) -> bool:
    """
    메시지가 웹 검색이 필요한 질문인지 확인
    
    Args:
        message: 사용자 메시지
    
    Returns:
        웹 검색이 필요하면 True
    """
    # 뉴스 관련 질문은 뉴스 API를 사용하므로 제외
    if _is_news_related(message):
        return False
    
    # 웹 검색이 필요한 키워드들
    search_keywords = [
        "검색", "찾아", "알려줘", "어떻게", "무엇", "뭐야", "뭔가", 
        "정보", "자세히", "상세", "설명", "이유", "원인", "방법",
        "가격", "시세", "현재", "지금", "오늘", "최근", "최신",
        "비교", "차이", "장단점", "장점", "단점", "추천"
    ]
    
    # 질문 형태인지 확인 (?, 어떻게, 무엇 등)
    question_indicators = ["?", "어떻게", "무엇", "뭐", "왜", "언제", "어디", "누구"]
    
    message_lower = message.lower()
    
    # 질문 형태이거나 검색 키워드가 포함되어 있으면 웹 검색 수행
    has_question = any(indicator in message for indicator in question_indicators)
    has_search_keyword = any(keyword in message_lower for keyword in search_keywords)
    
    # 너무 짧은 메시지는 제외 (예: "안녕", "고마워")
    if len(message.strip()) < 5:
        return False
    
    return has_question or has_search_keyword


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user_from_token)
):
    """
    Gemini API를 사용한 챗봇 대화
    
    - message: 사용자 메시지
    - previous_interaction_id: 이전 대화의 interaction_id (선택사항, 대화 히스토리 유지용)
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=400,
                detail="메시지를 입력해주세요."
            )
        
        # 뉴스 관련 질문인지 확인
        message = request.message
        enhanced_message = message
        context_parts = []
        
        if _is_news_related(message):
            # 암호화폐 심볼 추출
            symbol = _extract_crypto_symbol(message)
            if not symbol:
                # 심볼이 없으면 일반적인 암호화폐 뉴스 가져오기
                symbol = "BTC"  # 기본값으로 BTC 사용
            
            try:
                # 최신 뉴스 가져오기
                news_list = await get_crypto_news(symbol=symbol, limit=5, lang="ko")
                if news_list:
                    news_context = _format_news_for_context(news_list)
                    context_parts.append(news_context)
            except Exception as e:
                # 뉴스 가져오기 실패해도 계속 진행
                print(f"뉴스 가져오기 실패: {str(e)}")
        
        # 웹 검색이 필요한 질문인지 확인
        if _needs_web_search(message):
            try:
                # 웹 검색 수행
                search_results = await search_web(query=message, num_results=5, lang="ko")
                if search_results:
                    search_context = format_search_results_for_context(search_results)
                    context_parts.append(search_context)
            except Exception as e:
                # 웹 검색 실패해도 계속 진행
                print(f"웹 검색 실패: {str(e)}")
        
        # 컨텍스트가 있으면 메시지에 추가
        if context_parts:
            context_text = "\n\n".join(context_parts)
            enhanced_message = (
                f"{context_text}\n\n"
                f"[사용자 질문]\n{message}\n\n"
                f"위의 정보를 참고하여 사용자의 질문에 정확하고 상세하게 답변해주세요. "
                f"정보가 있으면 구체적으로 언급하고, 출처 링크도 제공해주세요."
            )
        
        result = chat_with_gemini(
            message=enhanced_message,
            previous_interaction_id=request.previous_interaction_id
        )
        
        return ChatResponse(
            response=result["response"],
            interaction_id=result["interaction_id"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"챗봇 응답 생성 실패: {str(e)}"
        )

