/**
 * 환율 유틸리티 함수
 */

// USD to KRW 환율 (기본값: 1,300원, 실시간으로 업데이트 가능)
let usdToKrwRate = 1300;

/**
 * USD to KRW 환율 가져오기
 * 무료 API를 사용하거나 기본값 반환
 */
export async function getUsdToKrwRate(): Promise<number> {
  try {
    // 무료 환율 API 사용 (exchangerate-api.com)
    // 실제 프로덕션에서는 백엔드에서 환율을 관리하는 것이 좋습니다
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        cache: "no-store", // 클라이언트 컴포넌트에서는 no-store 사용
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const rate = data.rates?.KRW;
      if (rate && typeof rate === "number") {
        usdToKrwRate = rate;
        return rate;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch exchange rate, using default:", error);
  }
  
  // 기본값 반환
  return usdToKrwRate;
}

/**
 * USD를 KRW로 변환
 */
export function usdToKrw(usd: number, rate?: number): number {
  const exchangeRate = rate || usdToKrwRate;
  return usd * exchangeRate;
}

/**
 * 가격을 원화로 포맷팅
 */
export function formatKrwPrice(price: number, rate?: number): string {
  const krwPrice = usdToKrw(price, rate);
  
  if (krwPrice >= 1e12) {
    return `₩${(krwPrice / 1e12).toFixed(2)}조`;
  } else if (krwPrice >= 1e8) {
    return `₩${(krwPrice / 1e8).toFixed(2)}억`;
  } else if (krwPrice >= 1e4) {
    return `₩${(krwPrice / 1e4).toFixed(2)}만`;
  } else if (krwPrice >= 1) {
    return `₩${krwPrice.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}`;
  } else {
    return `₩${krwPrice.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`;
  }
}

/**
 * 환율 설정 (테스트용)
 */
export function setUsdToKrwRate(rate: number): void {
  usdToKrwRate = rate;
}

