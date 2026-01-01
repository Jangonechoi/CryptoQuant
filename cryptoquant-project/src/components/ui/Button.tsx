import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  children: ReactNode;
  isLoading?: boolean;
}

export default function Button({
  variant = "primary",
  children,
  isLoading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-primary-500 hover:bg-primary-600 text-neutral-900",
    secondary: "bg-neutral-700 hover:bg-neutral-600 text-neutral-100",
    danger: "bg-danger hover:bg-danger/90 text-white",
    success: "bg-success hover:bg-success/90 text-white",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          처리 중...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

