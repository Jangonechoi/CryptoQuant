"use client";

import Image from "next/image";
import { getCoinLogoUrl } from "@/lib/utils/coinLogo";

interface PriceHeaderProps {
  symbol: string;
  price?: number;
  change24h?: number;
  changePercent24h?: number;
  volume24h?: number;
}

export default function PriceHeader({
  symbol,
  price,
  change24h,
  changePercent24h,
  volume24h,
}: PriceHeaderProps) {
  const isPositive = change24h && change24h >= 0;
  const baseSymbol = symbol.replace("USDT", "").toUpperCase();
  const logoUrl = getCoinLogoUrl(symbol, "large");
  const fallbackUrls = [
    `https://cryptoicons.org/api/icon/${baseSymbol.toLowerCase()}/200`,
    `https://assets.coinlore.com/img/50x50/${baseSymbol.toLowerCase()}.png`,
  ];

  return (
    <div className="card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={logoUrl}
              alt={baseSymbol}
              fill
              className="rounded-full"
              sizes="64px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const currentSrc = target.src;
                const fallbackIndex = fallbackUrls.findIndex((url) =>
                  currentSrc.includes(url.split("/").pop() || "")
                );
                if (fallbackIndex < fallbackUrls.length - 1) {
                  target.src = fallbackUrls[fallbackIndex + 1];
                } else {
                  target.src = `https://cryptoicons.org/api/icon/btc/200`;
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 mb-2">
              {baseSymbol}
            </h1>
            {price !== undefined ? (
              <p className="text-2xl font-semibold text-neutral-100">
                US${price.toLocaleString()}
              </p>
            ) : (
              <div className="h-8 w-32 bg-neutral-700 rounded animate-pulse" />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          {change24h !== undefined && changePercent24h !== undefined ? (
            <div>
              <p className="text-sm text-neutral-400 mb-1">24시간 변동</p>
              <p
                className={`text-lg font-semibold ${
                  isPositive ? "text-success" : "text-danger"
                }`}
              >
                {isPositive ? "+" : ""}
                {change24h.toLocaleString()} ({isPositive ? "+" : ""}
                {changePercent24h.toFixed(2)}%)
              </p>
            </div>
          ) : (
            <div className="h-12 w-32 bg-neutral-700 rounded animate-pulse" />
          )}

          {volume24h !== undefined ? (
            <div>
              <p className="text-sm text-neutral-400 mb-1">24시간 거래량</p>
              <p className="text-lg font-semibold text-neutral-100">
                US${volume24h.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="h-12 w-32 bg-neutral-700 rounded animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
