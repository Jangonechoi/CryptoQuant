"use client";

import Link from "next/link";
import Image from "next/image";
import { useMarketPrices, useKlines } from "@/lib/api/queries";
import { getCoinLogoUrl } from "@/lib/utils/coinLogo";

interface CoinListProps {
  symbols?: string[];
  columns?: number;
  title?: string;
}

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

// 간단한 미니 차트 컴포넌트
function MiniSparkline({
  symbol,
  isPositive,
}: {
  symbol: string;
  isPositive: boolean;
}) {
  // 리스트 뷰에서는 자동 갱신 비활성화 (요청 횟수 최적화)
  const { data: klinesData, isLoading } = useKlines(symbol, "1h", 24, {
    refetchInterval: false, // 자동 갱신 비활성화
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });

  if (isLoading || !klinesData?.data || klinesData.data.length === 0) {
    return <div className="w-20 h-10 bg-neutral-800 rounded animate-pulse" />;
  }

  const prices: number[] = klinesData.data.map(
    (item: { close: number }) => item.close
  );
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const width = 80;
  const height = 40;
  const padding = 4;

  const points = prices.map((price: number, index: number) => {
    const x = (index / (prices.length - 1)) * (width - padding * 2) + padding;
    const y =
      height -
      padding -
      ((price - minPrice) / priceRange) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  return (
    <div className="w-20 h-10 flex-shrink-0">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
      >
        <path
          d={pathData}
          fill="none"
          stroke={isPositive ? "#16C784" : "#EA3943"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function CoinCard({ symbol, price, changePercent24h }: CoinCardProps) {
  const baseSymbol = symbol.replace("USDT", "").toUpperCase();

  // 코인 이름 매핑
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
  const fallbackUrls = [
    `https://cryptoicons.org/api/icon/${baseSymbol.toLowerCase()}/200`,
    `https://assets.coinlore.com/img/50x50/${baseSymbol.toLowerCase()}.png`,
  ];

  return (
    <Link
      href={`/markets/${symbol.toLowerCase()}`}
      className="card p-4 hover:bg-neutral-700 transition-colors block"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src={logoUrl}
            alt={baseSymbol}
            fill
            className="rounded-full"
            sizes="40px"
            onError={(e) => {
              // 이미지 로드 실패 시 대체 이미지 사용
              const target = e.target as HTMLImageElement;
              const currentSrc = target.src;
              const fallbackIndex = fallbackUrls.findIndex((url) =>
                currentSrc.includes(url.split("/").pop() || "")
              );
              if (fallbackIndex < fallbackUrls.length - 1) {
                target.src = fallbackUrls[fallbackIndex + 1];
              } else {
                // 모든 대체 이미지 실패 시 기본 이미지
                target.src = `https://cryptoicons.org/api/icon/btc/200`;
              }
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-neutral-100 truncate">
            {baseSymbol}
          </h3>
          <p className="text-xs text-neutral-400 truncate">{coinName}</p>
        </div>
        <MiniSparkline symbol={symbol} isPositive={isPositive} />
      </div>
      <div className="space-y-1">
        <p className="text-xl font-semibold text-neutral-100">
          US$
          {price.toLocaleString(undefined, {
            maximumFractionDigits: price < 1 ? 6 : 2,
          })}
        </p>
        <p
          className={`text-sm font-semibold ${
            isPositive ? "text-success" : "text-danger"
          }`}
        >
          {isPositive ? "+" : ""}
          {changePercent24h.toFixed(2)}%
        </p>
      </div>
    </Link>
  );
}

export default function CoinList({
  symbols,
  columns = 5,
  title = "인기 암호화폐",
}: CoinListProps) {
  // 최적화된 API 사용: 한 번에 모든 코인 가격 가져오기
  const { data, isLoading } = useMarketPrices(symbols);

  // Tailwind 동적 클래스 대신 고정 클래스 사용
  const gridColsClass =
    columns === 5
      ? "lg:grid-cols-5"
      : columns === 4
      ? "lg:grid-cols-4"
      : columns === 3
      ? "lg:grid-cols-3"
      : "lg:grid-cols-5";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-100">{title}</h2>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${gridColsClass} gap-4`}
        >
          {Array.from({ length: symbols?.length || 20 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-neutral-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-neutral-700 rounded animate-pulse" />
                    <div className="h-4 bg-neutral-700 rounded animate-pulse w-20" />
                  </div>
                </div>
                <div className="h-6 bg-neutral-700 rounded animate-pulse" />
                <div className="h-4 bg-neutral-700 rounded animate-pulse w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const prices: CoinPriceData[] = data?.prices || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutral-100">{title}</h2>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${gridColsClass} gap-4`}
      >
        {prices.map((coin) => (
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
