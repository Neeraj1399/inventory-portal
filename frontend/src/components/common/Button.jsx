import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", // primary, secondary, danger, ghost, warning
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  icon: Icon = null,
  iconPosition = "left"
}) => {
  const variants = {
    primary: "bg-accent-gradient text-white shadow-glow hover:brightness-110",
    secondary: "bg-bg-secondary border border-border text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
    danger: "bg-status-danger text-white shadow-glow-sm hover:brightness-110",
    warning: "bg-status-warning text-white shadow-glow-sm hover:brightness-110",
    ghost: "bg-transparent text-text-muted hover:text-white hover:bg-bg-tertiary",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs rounded-xl",
    md: "px-6 py-3.5 text-sm rounded-2xl",
    lg: "px-8 py-4 text-base rounded-2xl",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative flex items-center justify-center gap-3 font-semibold transition-all duration-200 ease-out
        hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-bg-primary
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon size={18} className="shrink-0" />}
          <span className="relative z-10">{children}</span>
          {Icon && iconPosition === "right" && <Icon size={18} className="shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
