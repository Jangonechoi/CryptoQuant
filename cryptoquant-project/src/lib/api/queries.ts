import { useQuery, useMutation } from "@tanstack/react-query";
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
    refetchInterval: 1000 * 60, // 1분마다 자동 갱신
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

// 여러 코인 가격 조회 (최적화)
export const useMarketPrices = (symbols?: string[], allCoins?: boolean) => {
  return useQuery({
    queryKey: ["marketPrices", symbols, allCoins],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/prices`, {
        params: {
          ...(symbols ? { symbols } : {}),
          ...(allCoins ? { all_coins: true } : {}),
        },
      });
      return response.data;
    },
    staleTime: 1000 * 60, // 1분
  });
};

// 캔들스틱 데이터 조회
export const useKlines = (
  symbol: string,
  interval: string,
  limit: number = 100,
  options?: {
    refetchInterval?: number | false;
    staleTime?: number;
    startTime?: number; // Unix timestamp (초 단위)
  }
) => {
  return useQuery({
    queryKey: ["klines", symbol, interval, limit, options?.startTime],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/klines`, {
        params: {
          symbol,
          interval,
          limit,
          ...(options?.startTime ? { start_time: options.startTime } : {}),
        },
      });
      return response.data;
    },
    enabled: !!symbol && !!interval,
    staleTime: options?.staleTime ?? 1000 * 60, // 기본 1분
    refetchInterval: options?.refetchInterval ?? 1000 * 60, // 기본 1분마다 자동 갱신
  });
};

// 추가 캔들스틱 데이터 조회 (무한 스크롤용)
export const fetchKlines = async (
  symbol: string,
  interval: string,
  limit: number,
  startTime?: number
) => {
  const response = await apiClient.get(`/api/market/klines`, {
    params: {
      symbol,
      interval,
      limit,
      ...(startTime ? { start_time: startTime } : {}),
    },
  });
  return response.data;
};

// 백테스트 실행
export const useBacktest = (
  config: Record<string, unknown>,
  enabled: boolean = false
) => {
  // _runId는 queryKey에만 사용하고 실제 API 요청에서는 제거
  const { _runId, ...apiConfig } = config;

  return useQuery({
    queryKey: ["backtest", apiConfig, _runId], // runId로 캐시 구분
    queryFn: async () => {
      const response = await apiClient.post(
        `/api/strategy/backtest`,
        apiConfig
      );
      return response.data;
    },
    enabled,
    staleTime: 0,
    refetchOnMount: true,
    gcTime: 0, // 캐시 시간 0으로 설정
  });
};

// 현재 사용자 정보 조회
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await apiClient.get(`/api/auth/me`);
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 암호화폐 뉴스 조회
export const useCryptoNews = (
  symbol: string,
  limit: number = 10,
  lang: string = "ko"
) => {
  return useQuery({
    queryKey: ["cryptoNews", symbol, limit, lang],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/news`, {
        params: { symbol, limit, lang },
      });
      return response.data;
    },
    enabled: !!symbol,
    staleTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: false,
  });
};

// 소셜 미디어 게시물 조회 (Reddit, Twitter)
export const useSocialPosts = (symbol: string, limit: number = 10) => {
  return useQuery({
    queryKey: ["socialPosts", symbol, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/social`, {
        params: { symbol, limit },
      });
      return response.data;
    },
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
  });
};

// CoinGecko API 기반 쿼리들
// 최근 24시간 상위 상승 종목 조회
export const useTopGainers = (limit: number = 10) => {
  return useQuery({
    queryKey: ["topGainers", limit],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/top-gainers`, {
        params: { limit },
      });
      return response.data;
    },
    staleTime: 1000 * 60, // 1분
  });
};

// 거래량 상위 종목 조회
export const useTopVolume = (limit: number = 10) => {
  return useQuery({
    queryKey: ["topVolume", limit],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/top-volume`, {
        params: { limit },
      });
      return response.data;
    },
    staleTime: 1000 * 60, // 1분
  });
};

// 신규 상장 코인 조회
export const useNewListings = (limit: number = 10) => {
  return useQuery({
    queryKey: ["newListings", limit],
    queryFn: async () => {
      const response = await apiClient.get(`/api/market/new-listings`, {
        params: { limit },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5분 (신규 코인은 자주 변하지 않음)
  });
};

// 챗봇 메시지 전송 (mutation)
export const useChatMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      message: string;
      previous_interaction_id?: string;
    }) => {
      const response = await apiClient.post(`/api/chat/chat`, data);
      return response.data;
    },
  });
};
