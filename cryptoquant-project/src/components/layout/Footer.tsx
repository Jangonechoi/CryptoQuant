export default function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 브랜드 섹션 */}
          <div>
            <h3 className="text-lg font-bold text-primary-500 mb-4">CryptoQuant</h3>
            <p className="text-neutral-400 text-sm">
              AI 기반 암호화폐 차트 & 자동매매 데모 플랫폼
            </p>
          </div>

          {/* 링크 섹션 */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <a href="/markets" className="hover:text-primary-500 transition-colors">
                  시장 조회
                </a>
              </li>
              <li>
                <a href="/strategy/backtest" className="hover:text-primary-500 transition-colors">
                  백테스트
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:text-primary-500 transition-colors">
                  요금제
                </a>
              </li>
            </ul>
          </div>

          {/* 정보 섹션 */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-4">안내</h4>
            <p className="text-neutral-400 text-sm mb-2">
              본 서비스는 실제 거래를 실행하지 않으며,
            </p>
            <p className="text-neutral-400 text-sm">
              모든 자동매매 기능은 학습 및 시뮬레이션 목적으로만 제공됩니다.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          <p>&copy; 2024 CryptoQuant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

