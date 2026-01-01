import { create } from "zustand";

interface StrategyConfig {
  symbol: string;
  interval: string;
  startDate: string;
  endDate: string;
  strategyType: "moving_average" | "rsi" | "macd";
  parameters: Record<string, number>;
}

interface StrategyState {
  currentStrategy: StrategyConfig | null;
  setStrategy: (strategy: StrategyConfig) => void;
  clearStrategy: () => void;
}

export const useStrategyStore = create<StrategyState>((set) => ({
  currentStrategy: null,
  setStrategy: (strategy) => set({ currentStrategy: strategy }),
  clearStrategy: () => set({ currentStrategy: null }),
}));

