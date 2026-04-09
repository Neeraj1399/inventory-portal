import React from "react";
import { motion } from "framer-motion";

const Card = ({ children, className = "", onClick, noPadding = false }) => {
  // Use a generic div for standard transitions, reducing Framer Motion overhead for static components
  return (
    <div
      onClick={onClick}
      className={`
        bg-bg-secondary border border-border rounded-2xl shadow-sm overflow-hidden
        transition-all duration-200 ease-out
        ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:bg-bg-tertiary hover:shadow-md active:scale-[0.98]" : ""}
        ${!noPadding ? "p-6 lg:p-8" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
