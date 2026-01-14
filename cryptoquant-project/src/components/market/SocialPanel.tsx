"use client";

import { useSocialPosts } from "@/lib/api/queries";
import { useState } from "react";

interface SocialPanelProps {
  symbol: string;
}

interface SocialPost {
  id: string;
  title: string;
  body: string;
  url: string;
  source: string;
  author?: string;
  upvotes?: number;
  likes?: number;
  retweets?: number;
  comments?: number;
  publishedAt: number;
  type: "reddit" | "twitter";
}

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

export default function SocialPanel({ symbol }: SocialPanelProps) {
  const { data, isLoading, error } = useSocialPosts(symbol, 10);
  const [activeTab, setActiveTab] = useState<"reddit" | "twitter">("reddit");

  if (isLoading) {
    return (
      <div className="card">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-neutral-100 mb-6">
            커뮤니티 의견
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
            커뮤니티 의견
          </h2>
          <div className="text-neutral-400 text-center py-8">
            소셜 미디어 데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        </div>
      </div>
    );
  }

  const redditPosts: SocialPost[] = data?.reddit || [];
  const twitterPosts: SocialPost[] = data?.twitter || [];
  const activePosts = activeTab === "reddit" ? redditPosts : twitterPosts;

  return (
    <div className="card">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-neutral-100 mb-6">
          커뮤니티 의견
        </h2>

        {/* 탭 메뉴 */}
        <div className="flex gap-2 mb-6 border-b border-neutral-700">
          <button
            onClick={() => setActiveTab("reddit")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "reddit"
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Reddit ({redditPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("twitter")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "twitter"
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            X (Twitter) ({twitterPosts.length})
          </button>
        </div>

        {/* 게시물 목록 */}
        {activePosts.length === 0 ? (
          <div className="text-neutral-400 text-center py-8">
            {activeTab === "reddit"
              ? "Reddit 게시물이 없습니다."
              : "Twitter 게시물이 없습니다."}
          </div>
        ) : (
          <div className="space-y-4">
            {activePosts.map((post) => {
              const timeAgo = formatTimeAgo(post.publishedAt);

              return (
                <article
                  key={post.id}
                  className="border-b border-neutral-700 pb-4 last:border-b-0 last:pb-0"
                >
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group hover:opacity-80 transition-opacity"
                  >
                    <div className="flex gap-3">
                      {/* 플랫폼 아이콘 */}
                      <div className="flex-shrink-0 mt-1">
                        {post.type === "reddit" ? (
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-orange-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-base font-semibold text-neutral-100 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
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

                        {post.body && (
                          <p className="text-sm text-neutral-400 line-clamp-2 mb-2">
                            {post.body}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <span className="font-medium text-neutral-400">
                            {post.source}
                          </span>
                          {post.author && (
                            <>
                              <span>•</span>
                              <span>{post.author}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{timeAgo}</span>

                          {/* 통계 정보 */}
                          <div className="flex gap-3 ml-auto">
                            {post.type === "reddit" && (
                              <>
                                {post.upvotes !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.477.854l4-2.222a1 1 0 00.523-.854v-3.556a1 1 0 00-.523-.854l-4-2.222a1 1 0 00-1.477.834z" />
                                    </svg>
                                    {post.upvotes}
                                  </span>
                                )}
                                {post.comments !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {post.comments}
                                  </span>
                                )}
                              </>
                            )}
                            {post.type === "twitter" && (
                              <>
                                {post.likes !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {post.likes}
                                  </span>
                                )}
                                {post.retweets !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                                    </svg>
                                    {post.retweets}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

