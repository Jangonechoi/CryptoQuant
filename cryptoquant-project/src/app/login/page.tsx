"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: { theme?: string; size?: string; width?: number }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Google Identity Services 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleLoaded(true);
      initializeGoogleSignIn();
    };
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Google 로그인 초기화
  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google Client ID가 설정되지 않았습니다.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleSignIn,
      ux_mode: "popup", // 팝업 모드 명시
      auto_select: false, // 자동 선택 비활성화
    });
  };

  // Google 로그인 버튼 렌더링
  useEffect(() => {
    if (!googleLoaded || !window.google) return;

    const buttonContainer = document.getElementById("google-signin-button");
    if (buttonContainer) {
      buttonContainer.innerHTML = ""; // 기존 버튼 제거
      window.google.accounts.id.renderButton(buttonContainer, {
        theme: "outline",
        size: "large",
        width: 300,
        text: "signin_with", // "Google로 로그인" 텍스트
        shape: "rectangular",
      });
    }
  }, [googleLoaded]);

  // Google 로그인 콜백 처리
  const handleGoogleSignIn = async (response: { credential: string }) => {
    setLoading(true);
    setError(null);

    try {
      // Backend에 ID 토큰 전송
      const loginResponse = await apiClient.post("/api/auth/login", {
        provider: "google",
        token: response.credential,
      });

      const { user, token } = loginResponse.data;

      // 상태 저장
      setUser(user);
      setToken(token);

      // 대시보드로 리다이렉트
      router.push("/dashboard");
    } catch (err: any) {
      console.error("로그인 실패:", err);
      setError(
        err.response?.data?.detail ||
          "로그인에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="max-w-md w-full">
        <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-lg p-8 shadow-xl text-center">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">로그인</h1>
          <p className="text-neutral-400 mb-8">
            CryptoQuant에 오신 것을 환영합니다
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-center items-center">
              <div id="google-signin-button"></div>
            </div>

            {loading && (
              <div className="text-center">
                <p className="text-neutral-400 text-sm">로그인 처리 중...</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 text-center">
                로그인하면 CryptoQuant의 서비스 약관 및 개인정보 처리방침에
                동의하는 것으로 간주됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
