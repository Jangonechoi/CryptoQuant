"use client";

import { useCryptoNews } from "@/lib/api/queries";
import Image from "next/image";

// 시간 포맷 유틸리티 함수
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return "방금 전";
  }
}

interface NewsPanelProps {
  symbol: string;
}

interface NewsItem {
  id: string;
  title: string;
  body: string;
  url: string;
  source: string;
  imageUrl?: string;
  publishedAt: number;
  tags: string[];
  categories: string[];
}

export default function NewsPanel({ symbol }: NewsPanelProps) {
  const { data, isLoading, error } = useCryptoNews(symbol, 10);

  if (isLoading) {
    return (
      <div className="card">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">
            관련 뉴스
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-neutral-700 rounded w-full mb-2" />
                <div className="h-3 bg-neutral-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">
            관련 뉴스
          </h2>
          <div className="text-neutral-400 text-center py-8">
            뉴스를 불러오는 중 오류가 발생했습니다.
          </div>
        </div>
      </div>
    );
  }

  const newsList: NewsItem[] = data?.news || [];

  if (newsList.length === 0) {
    return (
      <div className="card">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">
            관련 뉴스
          </h2>
          <div className="text-neutral-400 text-center py-8">
            관련 뉴스가 없습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-neutral-100 mb-6">
          관련 뉴스
        </h2>
        <div className="space-y-6">
          {newsList.map((news) => {
            const timeAgo = formatTimeAgo(news.publishedAt);

            return (
              <article
                key={news.id}
                className="border-b border-neutral-700 pb-6 last:border-b-0 last:pb-0"
              >
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group hover:opacity-80 transition-opacity"
                >
                  <div className="flex gap-4">
                    {news.imageUrl && (
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-800">
                        <Image
                          src={news.imageUrl}
                          alt={news.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-primary transition-colors line-clamp-2">
                          {news.title}
                        </h3>
                        <svg
                          className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                        {news.body}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="font-medium text-neutral-400">
                          {news.source}
                        </span>
                        <span>•</span>
                        <span>{timeAgo}</span>
                        {news.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex gap-2 flex-wrap">
                              {news.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-neutral-800 rounded text-neutral-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

