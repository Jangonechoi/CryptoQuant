"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api/client";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 토큰이나 코드 추출 (필요한 경우)
        const token = searchParams.get("token");
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
          setError(error);
          setStatus("error");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return;
        }

        // Google OAuth는 프론트엔드에서 직접 처리하므로
        // 이 페이지는 주로 다른 OAuth 제공자나 리다이렉트 기반 플로우를 위한 것입니다
        // 현재는 로그인 페이지로 리다이렉트
        router.push("/login");
      } catch (err: any) {
        console.error("OAuth 콜백 처리 실패:", err);
        setError("인증 처리 중 오류가 발생했습니다.");
        setStatus("error");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="max-w-md w-full">
        <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-lg p-8 shadow-xl text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-neutral-100 mb-2">
                인증 처리 중...
              </h2>
              <p className="text-neutral-400 text-sm">잠시만 기다려주세요.</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-red-500 text-4xl mb-4">✕</div>
              <h2 className="text-xl font-bold text-neutral-100 mb-2">
                인증 실패
              </h2>
              <p className="text-neutral-400 text-sm mb-4">{error}</p>
              <p className="text-neutral-500 text-xs">
                로그인 페이지로 이동합니다...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
