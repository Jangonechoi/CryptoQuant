from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class LoginRequest(BaseModel):
    provider: str  # "google" or "github"
    token: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None


@router.post("/login")
async def login(request: LoginRequest):
    """
    소셜 로그인 처리
    """
    try:
        # 실제 소셜 로그인 검증 로직 구현 예정
        # 현재는 목업 응답
        return {
            "user": {
                "id": "user_123",
                "email": "user@example.com",
                "name": "Test User",
            },
            "token": "mock_jwt_token",
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="인증 실패")


@router.get("/me")
async def get_current_user():
    """
    현재 사용자 정보 조회
    """
    # 실제 구현 시 JWT 토큰 검증
    return {
        "id": "user_123",
        "email": "user@example.com",
        "name": "Test User",
    }

