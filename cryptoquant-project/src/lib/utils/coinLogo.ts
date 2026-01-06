/**
 * 암호화폐 로고 URL을 가져오는 유틸리티 함수
 * 여러 이미지 소스를 순차적으로 시도합니다.
 */

// CoinMarketCap 이미지 ID 매핑 (더 안정적)
// 형식: https://s2.coinmarketcap.com/static/img/coins/64x64/{id}.png
const coinMarketCapIds: Record<string, number> = {
  BTC: 1, // Bitcoin
  ETH: 1027, // Ethereum
  BNB: 1839, // Binance Coin
  XRP: 52, // XRP
  SOL: 5426, // Solana
  USDT: 825, // Tether
  USDC: 3408, // USD Coin
  DOGE: 5, // Dogecoin
  TRX: 1958, // TRON
  ADA: 2010, // Cardano
  AVAX: 5805, // Avalanche
  MATIC: 3890, // Polygon
  DOT: 6636, // Polkadot
  LINK: 1975, // Chainlink
  UNI: 7083, // Uniswap
  LTC: 2, // Litecoin
  ATOM: 3794, // Cosmos
  ETC: 1321, // Ethereum Classic
  XLM: 512, // Stellar
  ALGO: 4030, // Algorand
  NEAR: 6535, // NEAR Protocol
  FIL: 2280, // Filecoin
  ICP: 8916, // Internet Computer
  APT: 21794, // Aptos
  ARB: 11841, // Arbitrum
  OP: 11840, // Optimism
};

/**
 * 심볼을 기반으로 암호화폐 로고 URL을 반환합니다.
 * 여러 이미지 소스를 순차적으로 시도합니다.
 * @param symbol - 암호화폐 심볼 (예: "BTC", "ETH")
 * @param size - 이미지 크기 ("small", "large", "thumb" - 기본값: "large")
 * @returns 로고 이미지 URL
 */
export function getCoinLogoUrl(
  symbol: string,
  size: "small" | "large" | "thumb" = "large"
): string {
  const baseSymbol = symbol.replace("USDT", "").toUpperCase();
  const cmcId = coinMarketCapIds[baseSymbol];

  // CoinMarketCap 이미지 사용 (가장 안정적)
  if (cmcId) {
    // CoinMarketCap은 64x64, 128x128, 200x200 크기를 지원
    const sizeMap: Record<string, string> = {
      small: "64x64",
      large: "200x200",
      thumb: "128x128",
    };
    return `https://s2.coinmarketcap.com/static/img/coins/${sizeMap[size]}/${cmcId}.png`;
  }

  // CoinMarketCap ID가 없는 경우, cryptoicons.org를 대체로 사용
  return `https://cryptoicons.org/api/icon/${baseSymbol.toLowerCase()}/200`;
}

/**
 * 대체 로고 URL 목록을 반환합니다 (이미지 로드 실패 시 사용)
 */
export function getFallbackLogoUrls(symbol: string): string[] {
  const baseSymbol = symbol.replace("USDT", "").toUpperCase();
  const lowerSymbol = baseSymbol.toLowerCase();

  return [
    `https://cryptoicons.org/api/icon/${lowerSymbol}/200`,
    `https://assets.coinlore.com/img/50x50/${lowerSymbol}.png`,
    `https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png`, // 기본 Bitcoin 이미지
  ];
}
