"use client";

import CoinList from "@/components/market/CoinList";
import MarketHighlights from "@/components/market/MarketHighlights";

export default function MarketsPage() {
  // 인기 암호화폐 목록
  const popularSymbols = [
    "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "SOLUSDT",
    "USDCUSDT",
    "DOGEUSDT",
    "TRXUSDT",
    "ADAUSDT",
    "AVAXUSDT",
    "MATICUSDT",
    "DOTUSDT",
    "LINKUSDT",
    "UNIUSDT",
    "LTCUSDT",
    "ATOMUSDT",
    "ETCUSDT",
    "XLMUSDT",
    "ALGOUSDT",
    "NEARUSDT",
    "FILUSDT",
    "ICPUSDT",
    "APTUSDT",
    "ARBUSDT",
    "OPUSDT",
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-100 mb-2">
          암호화폐 시장
        </h1>
        <p className="text-neutral-400">
          실시간 암호화폐 가격 및 시장 정보를 확인하세요.
        </p>
      </div>

      {/* 시장 하이라이트 영역 */}
      <MarketHighlights />

      {/* 암호화폐 리스트 - 한 줄에 5개씩 표시 */}
      <CoinList symbols={popularSymbols} columns={5} title="인기 암호화폐" />
    </div>
  );
}
