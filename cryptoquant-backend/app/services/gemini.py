from google import genai
from dotenv import load_dotenv
from typing import Optional
import os
from datetime import datetime

load_dotenv()

# Gemini API 키 설정 (여러 환경 변수 이름 지원)
GOOGLE_API_KEY = (
    os.getenv("GOOGLE_API_KEY") 
    or os.getenv("GEMINI_API_KEY")
    or os.getenv("GOOGLE_GENAI_API_KEY")
)

# API 키 앞뒤 공백 제거
if GOOGLE_API_KEY:
    GOOGLE_API_KEY = GOOGLE_API_KEY.strip()

if not GOOGLE_API_KEY:
    raise ValueError(
        "GOOGLE_API_KEY, GEMINI_API_KEY 또는 GOOGLE_GENAI_API_KEY 환경 변수가 설정되지 않았습니다.\n"
        ".env 파일에 다음 중 하나를 추가하세요:\n"
        "GOOGLE_API_KEY=your-api-key-here\n\n"
        "API 키는 Google AI Studio에서 발급받을 수 있습니다: https://aistudio.google.com/apikey"
    )

# API 키가 비어있지 않은지 확인
if not GOOGLE_API_KEY or len(GOOGLE_API_KEY) < 20:
    raise ValueError(
        "API 키가 유효하지 않습니다. API 키는 최소 20자 이상이어야 합니다.\n"
        "Google AI Studio에서 새로운 API 키를 발급받으세요: https://aistudio.google.com/apikey"
    )

# 클라이언트 초기화 (환경 변수도 자동으로 읽도록 설정)
try:
    # 명시적으로 API 키 전달
    client = genai.Client(api_key=GOOGLE_API_KEY)
except Exception as e:
    raise ValueError(
        f"Gemini 클라이언트 초기화 실패: {str(e)}\n"
        "API 키가 올바른지 확인하세요."
    )


def chat_with_gemini(
    message: str,
    previous_interaction_id: Optional[str] = None,
    model: str = "gemini-2.5-flash"
) -> dict:
    """
    Gemini API를 사용하여 챗봇 응답 생성
    
    Args:
        message: 사용자 메시지
        previous_interaction_id: 이전 대화의 interaction_id (대화 히스토리 유지용)
        model: 사용할 Gemini 모델명
    
    Returns:
        {
            "response": str,  # AI 응답 텍스트
            "interaction_id": str  # 다음 대화에서 사용할 interaction_id
        }
    """
    try:
        # 현재 날짜와 시간 정보 가져오기
        current_datetime = datetime.now()
        current_date_str = current_datetime.strftime("%Y년 %m월 %d일")
        current_time_str = current_datetime.strftime("%H시 %M분")
        current_weekday = current_datetime.strftime("%A")
        weekday_kr = {
            "Monday": "월요일",
            "Tuesday": "화요일",
            "Wednesday": "수요일",
            "Thursday": "목요일",
            "Friday": "금요일",
            "Saturday": "토요일",
            "Sunday": "일요일"
        }
        current_weekday_kr = weekday_kr.get(current_weekday, current_weekday)
        
        if previous_interaction_id:
            # 이전 대화가 있는 경우 - 날짜 정보를 주기적으로 업데이트하기 위해 간단히 포함
            date_context = f"[현재 날짜: {current_date_str} {current_weekday_kr} {current_time_str}]\n\n"
            enhanced_message = date_context + message
            
            interaction = client.interactions.create(
                model=model,
                input=enhanced_message,
                previous_interaction_id=previous_interaction_id
            )
        else:
            # 새로운 대화 시작 - 상세한 시스템 프롬프트 포함
            system_context = (
                f"[시스템 정보]\n"
                f"현재 날짜와 시간: {current_date_str} {current_weekday_kr} {current_time_str}\n"
                f"중요: 모든 날짜, 시간, 시점 관련 질문에 답할 때는 반드시 위의 현재 날짜를 기준으로 답변해주세요. "
                f"과거 날짜나 미래 날짜를 계산할 때도 이 날짜를 기준으로 계산해주세요.\n\n"
            )
            enhanced_message = system_context + message
            
            interaction = client.interactions.create(
                model=model,
                input=enhanced_message
            )
        
        # 응답 텍스트 추출
        response_text = interaction.outputs[-1].text if interaction.outputs else ""
        
        return {
            "response": response_text,
            "interaction_id": interaction.id
        }
    except Exception as e:
        error_msg = str(e)
        # API 키 관련 오류인 경우 더 친절한 메시지 제공
        if "API key" in error_msg or "API_KEY" in error_msg or "INVALID_ARGUMENT" in error_msg:
            raise Exception(
                f"Gemini API 키 오류: {error_msg}\n\n"
                "해결 방법:\n"
                "1. .env 파일에 GOOGLE_API_KEY=your-api-key를 올바르게 설정했는지 확인하세요.\n"
                "2. API 키 앞뒤에 공백이나 따옴표가 없는지 확인하세요.\n"
                "3. Google AI Studio(https://aistudio.google.com/apikey)에서 API 키가 활성화되어 있는지 확인하세요.\n"
                "4. API 키에 IP 제한이 설정되어 있다면, 현재 서버 IP를 허용 목록에 추가하세요.\n"
                "5. 필요시 새로운 API 키를 생성하여 사용하세요."
            )
        raise Exception(f"Gemini API 오류: {error_msg}")