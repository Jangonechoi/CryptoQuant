"use client";

import HotNewCoins from "./HotNewCoins";
import TopGainers from "./TopGainers";
import TopVolume from "./TopVolume";

export default function MarketHighlights() {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <HotNewCoins />
        </div>
        <div className="lg:col-span-1">
          <TopGainers />
        </div>
        <div className="lg:col-span-1">
          <TopVolume />
        </div>
      </div>
    </div>
  );
}
