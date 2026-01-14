"use client";

import Link from "next/link";
import { useTopGainers } from "@/lib/api/queries";
import { getCoinLogoUrl, getFallbackLogoUrls } from "@/lib/utils/coinLogo";
import { useState } from "react";

interface CoinPriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h?: number;
  low24h?: number;
}

interface CoinCardProps {
  symbol: string;
  price: number;
  changePercent24h: number;
}

// 가격 포맷팅 함수
function formatPrice(price: number): string {
  if (price >= 1e9) {
    return `$${(price / 1e9).toFixed(2)}B`;
  } else if (price >= 1e6) {
    return `$${(price / 1e6).toFixed(2)}M`;
  } else if (price >= 1e3) {
    return `$${(price / 1e3).toFixed(2)}K`;
  } else if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
}

function CoinCard({ symbol, price, changePercent24h }: CoinCardProps) {
  const baseSymbol = symbol.replace("USDT", "").toUpperCase();
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const coinNames: Record<string, string> = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    BNB: "Binance Coin",
    XRP: "XRP",
    SOL: "Solana",
    USDT: "Tether",
    USDC: "USD Coin",
    DOGE: "Dogecoin",
    TRX: "TRON",
    ADA: "Cardano",
    AVAX: "Avalanche",
    MATIC: "Polygon",
    DOT: "Polkadot",
    LINK: "Chainlink",
    UNI: "Uniswap",
    LTC: "Litecoin",
    ATOM: "Cosmos",
    ETC: "Ethereum Classic",
    XLM: "Stellar",
    ALGO: "Algorand",
    NEAR: "NEAR Protocol",
    FIL: "Filecoin",
    ICP: "Internet Computer",
    APT: "Aptos",
    ARB: "Arbitrum",
    OP: "Optimism",
  };

  const coinName = coinNames[baseSymbol] || baseSymbol;
  const isPositive = changePercent24h >= 0;

  const logoUrl = getCoinLogoUrl(symbol, "large");
  const fallbackUrls = getFallbackLogoUrls(symbol);
  const allImageUrls = [logoUrl, ...fallbackUrls];
  const currentImageUrl = allImageUrls[currentImageIndex] || allImageUrls[0];

  const handleImageError = () => {
    if (currentImageIndex < allImageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setImageError(true);
    }
  };

  return (
    <Link
      href={`/markets/${symbol.toLowerCase()}`}
      className="card p-3 hover:bg-neutral-700 transition-colors block"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative w-10 h-10 flex-shrink-0">
            {!imageError ? (
              <img
                src={currentImageUrl}
                alt={baseSymbol}
                className="w-full h-full rounded-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-neutral-700 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-neutral-400">
                  {baseSymbol.slice(0, 2)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-neutral-100 truncate">
              {baseSymbol}
            </h3>
            <p className="text-xs text-neutral-400 truncate">{coinName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-base font-bold text-neutral-100">
              {formatPrice(price)}
            </p>
          </div>
          <div className="text-right min-w-[70px]">
            <p
              className={`text-sm font-bold ${
                isPositive ? "text-success" : "text-danger"
              }`}
            >
              {isPositive ? "+" : ""}
              {changePercent24h.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TopGainers() {
  const { data, isLoading } = useTopGainers(3);

  const topGainers: CoinPriceData[] = data?.prices || [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-neutral-100">
          최근 24시간 상위 상승종목
        </h2>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-neutral-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-700 rounded animate-pulse w-20" />
                    <div className="h-3 bg-neutral-700 rounded animate-pulse w-28" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-5 bg-neutral-700 rounded animate-pulse w-20" />
                  <div className="h-5 bg-neutral-700 rounded animate-pulse w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topGainers.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-neutral-100">
          최근 24시간 상위 상승종목
        </h2>
        <div className="card p-6 text-center">
          <p className="text-neutral-400">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-bold text-neutral-100">
        최근 24시간 상위 상승종목
      </h2>
      <div className="space-y-2">
        {topGainers.map((coin) => (
          <CoinCard
            key={coin.symbol}
            symbol={coin.symbol}
            price={coin.price}
            changePercent24h={coin.changePercent24h}
          />
        ))}
      </div>
    </div>
  );
}
