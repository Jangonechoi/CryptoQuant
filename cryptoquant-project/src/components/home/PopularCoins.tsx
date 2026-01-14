"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCoinList, useMarketPrice } from "@/lib/api/queries";
import Loading from "@/components/ui/Loading";
import Card from "@/components/ui/Card";
import { getUsdToKrwRate, formatKrwPrice } from "@/lib/utils/exchangeRate";

const POPULAR_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

export default function PopularCoins() {
  const { data: coinList, isLoading: isCoinListLoading } = useCoinList();

  if (isCoinListLoading) {
    return <Loading text="코인 목록 로딩 중..." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {POPULAR_SYMBOLS.map((symbol) => (
        <CoinCard key={symbol} symbol={symbol} />
      ))}
    </div>
  );
}

function CoinCard({ symbol }: { symbol: string }) {
  const { data: marketData, isLoading } = useMarketPrice(symbol, "1d");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const baseSymbol = symbol.replace("USDT", "");
  const coinName =
    baseSymbol === "BTC"
      ? "Bitcoin"
      : baseSymbol === "ETH"
      ? "Ethereum"
      : baseSymbol === "BNB"
      ? "Binance Coin"
      : baseSymbol;

  // 환율 가져오기
  useEffect(() => {
    getUsdToKrwRate().then(setExchangeRate).catch(() => {
      setExchangeRate(1300);
    });
  }, []);

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-2">
          <div className="h-6 bg-neutral-700 rounded animate-pulse" />
          <div className="h-8 bg-neutral-700 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  const change = marketData?.changePercent24h || 0;
  const price = marketData?.price || 0;

  return (
    <Link
      href={`/markets/${symbol.toLowerCase()}`}
      className="card hover:bg-neutral-700 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-neutral-100">{baseSymbol}</h3>
          <p className="text-sm text-neutral-400">{coinName}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-2xl font-bold text-neutral-100">
            US${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          {exchangeRate && (
            <p className="text-lg font-medium text-neutral-400 mt-1">
              {formatKrwPrice(price, exchangeRate)}
            </p>
          )}
        </div>
        <p
          className={`text-sm font-semibold ${
            change >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)}%
        </p>
      </div>
    </Link>
  );
}
