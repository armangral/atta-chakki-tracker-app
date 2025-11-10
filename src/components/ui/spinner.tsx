import React from "react";

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type SpinnerVariant = "primary" | "primary-dark" | "white" | "gray" | "blue";

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "primary",
  className = "",
}) => {
  // Size configurations
  const sizeClasses: Record<SpinnerSize, string> = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16",
  };

  // Color configurations
  const variantClasses: Record<SpinnerVariant, string> = {
    primary: "border-primary-light border-t-transparent",
    "primary-dark": "border-primary-dark border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-400 border-t-transparent",
    blue: "border-primary border-t-transparent",
  };

  const spinnerClasses = `
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    border-2 rounded-full animate-spin
    ${className}
  `.trim();

  return <div className={spinnerClasses} />;
};

export default Spinner;
