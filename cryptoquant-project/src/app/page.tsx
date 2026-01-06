"use client";

import Link from "next/link";
import PopularCoins from "@/components/home/PopularCoins";

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {/* 히어로 섹션 */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-100 mb-4">
          AI 기반 암호화폐 차트 & 자동매매 데모
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-8">
          실시간 암호화폐 시세 데이터를 시각적으로 확인하고,
          <br />
          자동매매 전략을 설정하여 모의 백테스트를 수행해보세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/markets" className="btn-primary">
            시장 조회 시작하기
          </Link>
          <Link href="/strategy/backtest" className="btn-secondary">
            백테스트 실행
          </Link>
        </div>
      </section>

      {/* 시장 요약 카드 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-neutral-100 mb-6">
          인기 암호화폐
        </h2>
        <PopularCoins />
      </section>

      {/* 차트 프리뷰 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-neutral-100 mb-6">
          BTC/USDT 가격 차트
        </h2>
        <div className="card">
          <div className="h-64 bg-neutral-700 rounded-lg flex items-center justify-center">
            <p className="text-neutral-400">
              차트 영역 (TradingView 차트 통합 예정)
            </p>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-neutral-100 mb-2">
            실시간 차트
          </h3>
          <p className="text-neutral-400 text-sm">
            주요 암호화폐의 실시간 시세를 차트로 확인하세요.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-neutral-100 mb-2">
            자동매매 전략
          </h3>
          <p className="text-neutral-400 text-sm">
            다양한 전략을 설정하고 백테스트를 통해 성과를 확인하세요.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-bold text-neutral-100 mb-2">성과 분석</h3>
          <p className="text-neutral-400 text-sm">
            누적 수익률, 거래 횟수, 최대 낙폭 등을 분석하세요.
          </p>
        </div>
      </section>

      {/* 안내 섹션 */}
      <section className="mt-12 card bg-neutral-800 border border-warning/20">
        <div className="flex items-start gap-4">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-lg font-bold text-neutral-100 mb-2">
              안내사항
            </h3>
            <p className="text-neutral-400 text-sm">
              본 서비스는 실제 거래를 실행하지 않으며, 모든 자동매매 기능은 학습
              및 시뮬레이션 목적으로만 제공됩니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
