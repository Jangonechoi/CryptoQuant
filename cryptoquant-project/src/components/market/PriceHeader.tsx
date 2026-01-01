"use client";

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

  return (
    <div className="card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            {symbol.toUpperCase()}
          </h1>
          {price !== undefined ? (
            <p className="text-2xl font-semibold text-neutral-100">
              ₩{price.toLocaleString()}
            </p>
          ) : (
            <div className="h-8 w-32 bg-neutral-700 rounded animate-pulse" />
          )}
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
                ₩{volume24h.toLocaleString()}
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

