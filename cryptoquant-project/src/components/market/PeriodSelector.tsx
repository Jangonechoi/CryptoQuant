"use client";

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const periods = [
  { value: "7d", label: "7일" },
  { value: "1M", label: "1개월" },
  { value: "3M", label: "3개월" },
  { value: "1Y", label: "1년" },
  { value: "MAX", label: "최대" },
];

export default function PeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: PeriodSelectorProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPeriod === period.value
              ? "bg-primary-500 text-neutral-900"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
