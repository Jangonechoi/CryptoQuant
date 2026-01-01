import { create } from "zustand";

interface MarketState {
  selectedSymbol: string;
  selectedInterval: string;
  setSelectedSymbol: (symbol: string) => void;
  setSelectedInterval: (interval: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  selectedSymbol: "BTCUSDT",
  selectedInterval: "1d",
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setSelectedInterval: (interval) => set({ selectedInterval: interval }),
}));

