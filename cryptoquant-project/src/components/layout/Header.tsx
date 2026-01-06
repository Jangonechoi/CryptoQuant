"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const navItems = [
    { href: "/markets", label: "시장" },
    { href: "/strategy/backtest", label: "전략" },
    { href: "/pricing", label: "요금제" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-neutral-900 border-b border-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-500">
              CryptoQuant
            </span>
          </Link>

          {/* 네비게이션 메뉴 */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname?.startsWith(item.href)
                    ? "text-primary-500 bg-neutral-800"
                    : "text-neutral-300 hover:text-primary-500 hover:bg-neutral-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-primary-500 transition-colors"
                >
                  대시보드
                </Link>
                {user && (
                  <div className="flex items-center space-x-2">
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-neutral-300 hidden sm:inline">
                      {user.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-red-400 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 햄버거 메뉴 */}
      <div className="md:hidden border-t border-neutral-800">
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname?.startsWith(item.href)
                  ? "text-primary-500 bg-neutral-800"
                  : "text-neutral-300 hover:text-primary-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
