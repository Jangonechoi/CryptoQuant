import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

// 암호화폐 시세 조회
export const useMarketPrice = (symbol: string, interval: string) => {
  return useQuery({
    queryKey: ["marketPrice", symbol, interval],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/price`, {
        params: { symbol, interval },
      });
      return response.data;
    },
    enabled: !!symbol && !!interval,
    staleTime: 1000 * 60, // 1분
  });
};

// 코인 목록 조회
export const useCoinList = () => {
  return useQuery({
    queryKey: ["coinList"],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/coins`);
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10분
  });
};

// 캔들스틱 데이터 조회
export const useKlines = (symbol: string, interval: string, limit: number = 100) => {
  return useQuery({
    queryKey: ["klines", symbol, interval, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/klines`, {
        params: { symbol, interval, limit },
      });
      return response.data;
    },
    enabled: !!symbol && !!interval,
    staleTime: 1000 * 60, // 1분
  });
};

// 백테스트 실행
export const useBacktest = (config: any, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["backtest", config],
    queryFn: async () => {
      const response = await apiClient.post(`/api/strategy/backtest`, config);
      return response.data;
    },
    enabled,
    staleTime: 0,
  });
};

