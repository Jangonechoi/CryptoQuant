"use client";

interface IntervalSelectorProps {
  selectedInterval: string;
  onIntervalChange: (interval: string) => void;
}

const intervals = [
  { value: "1m", label: "1분" },
  { value: "5m", label: "5분" },
  { value: "15m", label: "15분" },
  { value: "1h", label: "1시간" },
  { value: "4h", label: "4시간" },
  { value: "1d", label: "1일" },
];

export default function IntervalSelector({
  selectedInterval,
  onIntervalChange,
}: IntervalSelectorProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {intervals.map((interval) => (
        <button
          key={interval.value}
          onClick={() => onIntervalChange(interval.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedInterval === interval.value
              ? "bg-primary-500 text-neutral-900"
              : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
          }`}
        >
          {interval.label}
        </button>
      ))}
    </div>
  );
}

