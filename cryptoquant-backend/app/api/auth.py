from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import httpx
from jose import JWTError, jwt

load_dotenv()

router = APIRouter()
security = HTTPBearer()

# 환경 변수
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Google OAuth 설정
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


class LoginRequest(BaseModel):
    provider: str  # "google" or "github"
    token: str  # Google ID token


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None


class LoginResponse(BaseModel):
    user: UserResponse
    token: str


async def verify_google_token(id_token: str) -> dict:
    """
    Google ID 토큰 검증
    """
    try:
        async with httpx.AsyncClient() as client:
            # Google의 토큰 검증 엔드포인트 호출
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            response.raise_for_status()
            token_info = response.json()
            
            # 클라이언트 ID 검증
            if GOOGLE_CLIENT_ID and token_info.get("aud") != GOOGLE_CLIENT_ID:
                raise HTTPException(
                    status_code=401, 
                    detail="Invalid token audience"
                )
            
            return token_info
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=401, 
            detail=f"Google token verification failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401, 
            detail=f"Token verification error: {str(e)}"
        )


def create_jwt_token(user_data: dict) -> str:
    """
    JWT 토큰 생성
    """
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_data["id"],  # subject (user ID)
        "email": user_data["email"],
        "name": user_data["name"],
        "exp": expiration,
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def verify_jwt_token(token: str) -> dict:
    """
    JWT 토큰 검증
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    JWT 토큰에서 현재 사용자 정보 추출
    """
    token = credentials.credentials
    payload = verify_jwt_token(token)
    return payload


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    소셜 로그인 처리
    """
    try:
        if request.provider == "google":
            # Google ID 토큰 검증
            token_info = await verify_google_token(request.token)
            
            # 사용자 정보 추출
            user_data = {
                "id": token_info.get("sub", ""),  # Google user ID
                "email": token_info.get("email", ""),
                "name": token_info.get("name", ""),
                "avatar": token_info.get("picture"),
            }
            
            # 필수 필드 검증
            if not user_data["id"] or not user_data["email"]:
                raise HTTPException(
                    status_code=400, 
                    detail="Invalid token: missing required user information"
                )
            
            # JWT 토큰 생성
            jwt_token = create_jwt_token(user_data)
            
            return LoginResponse(
                user=UserResponse(**user_data),
                token=jwt_token,
            )
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported provider: {request.provider}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401, 
            detail=f"인증 실패: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: dict = Depends(get_current_user_from_token)
):
    """
    현재 사용자 정보 조회
    """
    return UserResponse(
        id=current_user.get("sub", ""),
        email=current_user.get("email", ""),
        name=current_user.get("name", ""),
    )
