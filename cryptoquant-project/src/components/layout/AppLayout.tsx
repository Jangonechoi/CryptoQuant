"use client";

import Header from "./Header";
import Footer from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* 추가 별 레이어 - 작은 별들 */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 stars-layer"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 22%, rgba(255, 255, 255, 0.5), transparent),
            radial-gradient(1px 1px at 28% 42%, rgba(255, 255, 255, 0.4), transparent),
            radial-gradient(1px 1px at 38% 62%, rgba(255, 255, 255, 0.5), transparent),
            radial-gradient(1px 1px at 52% 32%, rgba(255, 255, 255, 0.4), transparent),
            radial-gradient(1px 1px at 68% 82%, rgba(255, 255, 255, 0.5), transparent),
            radial-gradient(1px 1px at 78% 12%, rgba(255, 255, 255, 0.4), transparent),
            radial-gradient(1px 1px at 88% 52%, rgba(255, 255, 255, 0.5), transparent),
            radial-gradient(1px 1px at 18% 72%, rgba(255, 255, 255, 0.4), transparent),
            radial-gradient(1px 1px at 48% 92%, rgba(255, 255, 255, 0.5), transparent),
            radial-gradient(1px 1px at 92% 38%, rgba(255, 255, 255, 0.4), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '150% 150%',
          opacity: 0.6
        }}
      />
      
      {/* 우주 배경 오버레이 (콘텐츠 위에 약간의 그라데이션) */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none z-0" />
      
      <div className="relative z-10">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

