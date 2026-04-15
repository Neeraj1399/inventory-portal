import React from "react";
import { motion } from "framer-motion";

const Input = ({ 
  icon: Icon, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  autoFocus = false,
  className = "",
  error = "",
  ...props
}) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      <div className="relative group">
        {Icon && (
          <Icon 
            size={18} 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-200 ease-out group-focus-within:text-accent-primary" 
          />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoFocus={autoFocus}
          className={`
            w-full bg-bg-secondary border border-border rounded-2xl px-6 py-4 text-sm text-text-primary placeholder-text-muted 
            outline-none transition-all duration-200 ease-out focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/20 focus:shadow-glow-sm shadow-sm
            ${Icon ? "pl-14" : ""}
            ${error ? "border-status-danger focus:ring-status-danger/20 focus:shadow-none" : ""}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-black text-status-danger tracking-widest ml-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
