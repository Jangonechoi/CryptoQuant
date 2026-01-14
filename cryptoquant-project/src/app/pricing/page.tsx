"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// 간단한 아이콘 컴포넌트들
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export default function PricingPage() {
  const plans = [
    {
      id: "safe",
      name: "안전한 전략",
      description: "안정적인 수익 추구를 위한 보수적인 전략",
      price: "₩29,000",
      period: "월",
      icon: ShieldIcon,
      color: "text-info",
      bgColor: "bg-info/10",
      borderColor: "border-info/30",
      features: [
        "보수적인 리스크 관리",
        "안정적인 수익률 추구",
        "낮은 변동성 전략",
        "기본 차트 분석 도구",
        "일일 리포트 제공",
        "이메일 지원",
      ],
      highlight: false,
    },
    {
      id: "standard",
      name: "Standard",
      description: "균형잡힌 전략으로 안정성과 수익성의 균형",
      price: "₩49,000",
      period: "월",
      icon: TrendingUpIcon,
      color: "text-primary-500",
      bgColor: "bg-primary-500/10",
      borderColor: "border-primary-500/30",
      features: [
        "균형잡힌 리스크 관리",
        "중간 수익률 목표",
        "다양한 전략 옵션",
        "고급 차트 분석 도구",
        "실시간 알림 제공",
        "우선 이메일 지원",
        "백테스트 기능",
      ],
      highlight: true,
    },
    {
      id: "aggressive",
      name: "공격적인 전략",
      description: "높은 수익 추구를 위한 적극적인 투자 전략",
      price: "₩79,000",
      period: "월",
      icon: ZapIcon,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      features: [
        "적극적인 리스크 관리",
        "높은 수익률 목표",
        "고변동성 전략",
        "프리미엄 차트 분석 도구",
        "실시간 거래 신호",
        "24/7 우선 지원",
        "고급 백테스트 기능",
        "전문가 컨설팅 (월 1회)",
      ],
      highlight: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-neutral-100 mb-4">요금제</h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
          투자 스타일에 맞는 최적의 전략을 선택하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.highlight
                  ? "ring-2 ring-primary-500 shadow-xl shadow-primary-500/20"
                  : ""
              } ${plan.borderColor}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 bg-primary-500 text-neutral-900 px-3 py-1 text-xs font-bold rounded-bl-lg">
                  인기
                </div>
              )}

              <div className="flex flex-col h-full">
                {/* 헤더 */}
                <div className="mb-6">
                  <div
                    className={`w-16 h-16 ${plan.bgColor} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-8 h-8 ${plan.color}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-100 mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-neutral-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-neutral-100">
                      {plan.price}
                    </span>
                    <span className="text-neutral-400">/{plan.period}</span>
                  </div>
                </div>

                {/* 기능 목록 */}
                <div className="flex-1 mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 버튼 */}
                <Button
                  variant={plan.highlight ? "primary" : "secondary"}
                  className="w-full mt-auto"
                >
                  {plan.highlight ? "지금 시작하기" : "선택하기"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 추가 정보 */}
      <div className="mt-12 text-center">
        <p className="text-neutral-400 text-sm">
          모든 요금제는 7일 무료 체험 기간이 포함됩니다.
        </p>
        <p className="text-neutral-400 text-sm mt-2">
          문의사항이 있으시면{" "}
          <a href="/contact" className="text-primary-500 hover:underline">
            고객지원
          </a>
          으로 연락주세요.
        </p>
      </div>
    </div>
  );
}
