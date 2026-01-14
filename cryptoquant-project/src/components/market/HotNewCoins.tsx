"use client";

import MiniChart from "./MiniChart";

export default function HotNewCoins() {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-bold text-neutral-100">주요 암호화폐 차트</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MiniChart symbol="BTCUSDT" name="Bitcoin" height={120} />
        <MiniChart symbol="ETHUSDT" name="Ethereum" height={120} />
      </div>
    </div>
  );
}
