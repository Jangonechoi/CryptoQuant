"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import Button from "../ui/Button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  response: string;
  interaction_id: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "안녕하세요! 암호화폐에 대해 궁금한 것이 있으시면 언제든지 물어보세요. 😊",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await apiClient.post("/api/chat/chat", {
        message,
        previous_interaction_id: interactionId || undefined,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setInteractionId(data.interaction_id);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail || "알 수 없는 오류가 발생했습니다."
          : error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `죄송합니다. 오류가 발생했습니다: ${errorMessage}`,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    chatMutation.mutate(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "안녕하세요! 암호화폐에 대해 궁금한 것이 있으시면 언제든지 물어보세요. 😊",
        timestamp: new Date(),
      },
    ]);
    setInteractionId(null);
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setIsMinimized(false);
          }
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-neutral-900 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="챗봇 열기"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-80 flex flex-col bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl transition-all duration-300 ${
            isMinimized ? "h-auto" : "h-[500px]"
          }`}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-800 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-neutral-100">
                AI 챗봇
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {!isMinimized && (
                <button
                  onClick={handleReset}
                  className="text-neutral-400 hover:text-neutral-100 text-sm px-2 py-1 rounded hover:bg-neutral-700 transition-colors"
                  title="대화 초기화"
                >
                  초기화
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-neutral-400 hover:text-neutral-100 p-1 rounded hover:bg-neutral-700 transition-colors"
                aria-label={isMinimized ? "확장" : "최소화"}
                title={isMinimized ? "확장" : "최소화"}
              >
                {isMinimized ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="text-neutral-400 hover:text-neutral-100 p-1 rounded hover:bg-neutral-700 transition-colors"
                aria-label="닫기"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary-500 text-neutral-900"
                          : "bg-neutral-800 text-neutral-100"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p className="text-xs mt-1 opacity-60">
                        {message.timestamp.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-800 text-neutral-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="animate-pulse">💭</span>
                        <span className="text-sm">생각 중...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className="p-4 border-t border-neutral-700 bg-neutral-800 rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    disabled={chatMutation.isPending}
                    className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || chatMutation.isPending}
                    isLoading={chatMutation.isPending}
                    className="px-4"
                  >
                    전송
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
