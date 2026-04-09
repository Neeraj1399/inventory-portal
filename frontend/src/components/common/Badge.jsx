import React from "react";

const Badge = ({ 
  children, 
  variant = "muted", // primary, secondary, success, warning, danger, info, muted
  className = "",
  size = "md"
}) => {
  const variants = {
    primary: "bg-accent-primary/15 text-accent-primary border-accent-primary/20",
    secondary: "bg-accent-secondary/15 text-accent-secondary border-accent-secondary/20",
    success: "bg-status-success/15 text-status-success border-status-success/20",
    warning: "bg-status-warning/15 text-status-warning border-status-warning/20",
    danger: "bg-status-danger/15 text-status-danger border-status-danger/20",
    info: "bg-status-info/15 text-status-info border-status-info/20",
    muted: "bg-bg-tertiary text-text-disabled border-border",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-[9px]",
    md: "px-4 py-1.5 text-[10px]",
    lg: "px-5 py-2 text-[11px]",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center font-black uppercase tracking-widest border rounded-full transition-all
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
