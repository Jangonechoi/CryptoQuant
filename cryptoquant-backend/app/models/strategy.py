from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Strategy(Base):
    """
    전략 모델
    """
    __tablename__ = "strategies"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    symbol = Column(String, nullable=False)  # 거래할 암호화폐 심볼 (예: BTCUSDT)
    interval = Column(String, nullable=False)  # 차트 간격 (예: 1h, 4h, 1d)
    strategy_type = Column(String, nullable=False)  # 전략 타입
    parameters = Column(JSON, nullable=True)  # 전략 파라미터 (JSON 형태)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계 설정
    backtest_results = relationship("BacktestResult", back_populates="strategy", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Strategy(id={self.id}, name={self.name}, symbol={self.symbol})>"


class BacktestResult(Base):
    """
    백테스트 결과 모델
    """
    __tablename__ = "backtest_results"

    id = Column(String, primary_key=True, index=True)
    strategy_id = Column(String, ForeignKey("strategies.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # 백테스트 설정
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    initial_capital = Column(Float, nullable=False)
    
    # 백테스트 결과
    final_equity = Column(Float, nullable=False)
    total_return = Column(Float, nullable=False)  # 총 수익률 (%)
    total_trades = Column(Integer, nullable=False)
    winning_trades = Column(Integer, nullable=False)
    losing_trades = Column(Integer, nullable=False)
    win_rate = Column(Float, nullable=False)  # 승률 (%)
    max_drawdown = Column(Float, nullable=False)  # 최대 낙폭 (%)
    sharpe_ratio = Column(Float, nullable=True)  # 샤프 비율
    
    # 상세 결과 데이터 (JSON 형태로 저장)
    equity_curve = Column(JSON, nullable=True)  # 자산 곡선 데이터
    trades = Column(JSON, nullable=True)  # 거래 내역
    monthly_returns = Column(JSON, nullable=True)  # 월별 수익률
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 설정
    strategy = relationship("Strategy", back_populates="backtest_results")

    def __repr__(self):
        return f"<BacktestResult(id={self.id}, strategy_id={self.strategy_id}, total_return={self.total_return}%)>"

