"""
데이터베이스 사용 예시

이 파일은 데이터베이스 사용 방법을 보여주는 예시입니다.
실제 API 엔드포인트에서는 이와 유사한 방식으로 데이터베이스를 사용할 수 있습니다.
"""

from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models.user import User
from app.models.strategy import Strategy, BacktestResult
from datetime import datetime
import uuid


# 예시 1: 사용자 생성
def create_user_example():
    """사용자 생성 예시"""
    db: Session = SessionLocal()
    try:
        user = User(
            id=str(uuid.uuid4()),
            email="example@example.com",
            name="홍길동",
            avatar="https://example.com/avatar.jpg"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"사용자 생성 완료: {user}")
        return user
    except Exception as e:
        db.rollback()
        print(f"오류 발생: {e}")
        raise
    finally:
        db.close()


# 예시 2: 사용자 조회
def get_user_example(user_id: str):
    """사용자 조회 예시"""
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            print(f"사용자 조회: {user}")
        else:
            print("사용자를 찾을 수 없습니다.")
        return user
    finally:
        db.close()


# 예시 3: 전략 생성
def create_strategy_example(user_id: str):
    """전략 생성 예시"""
    db: Session = SessionLocal()
    try:
        strategy = Strategy(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="이동평균 전략",
            description="단순 이동평균 교차 전략",
            symbol="BTCUSDT",
            interval="1h",
            strategy_type="moving_average",
            parameters={
                "short_period": 10,
                "long_period": 30
            }
        )
        db.add(strategy)
        db.commit()
        db.refresh(strategy)
        print(f"전략 생성 완료: {strategy}")
        return strategy
    except Exception as e:
        db.rollback()
        print(f"오류 발생: {e}")
        raise
    finally:
        db.close()


# 예시 4: 백테스트 결과 저장
def create_backtest_result_example(strategy_id: str, user_id: str):
    """백테스트 결과 저장 예시"""
    db: Session = SessionLocal()
    try:
        backtest_result = BacktestResult(
            id=str(uuid.uuid4()),
            strategy_id=strategy_id,
            user_id=user_id,
            start_date=datetime(2024, 1, 1),
            end_date=datetime(2024, 12, 31),
            initial_capital=10000.0,
            final_equity=12000.0,
            total_return=20.0,
            total_trades=50,
            winning_trades=30,
            losing_trades=20,
            win_rate=60.0,
            max_drawdown=5.0,
            sharpe_ratio=1.5,
            equity_curve=[{"date": "2024-01-01", "equity": 10000}],
            trades=[],
            monthly_returns={}
        )
        db.add(backtest_result)
        db.commit()
        db.refresh(backtest_result)
        print(f"백테스트 결과 저장 완료: {backtest_result}")
        return backtest_result
    except Exception as e:
        db.rollback()
        print(f"오류 발생: {e}")
        raise
    finally:
        db.close()


# 예시 5: FastAPI 엔드포인트에서 사용하는 방법
"""
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

@router.get("/users/{user_id}")
async def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
"""

