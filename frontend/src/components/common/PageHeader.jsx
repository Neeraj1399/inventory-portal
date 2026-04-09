import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  onBack, 
  backPath, 
  action 
}) => {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-10 border-b border-border relative">
      <div className="flex items-start gap-8 group/header">
        {(onBack || backPath) && (
          <div className="pt-1">
            {backPath ? (
              <Link 
                to={backPath}
                className="p-4 bg-bg-secondary border border-border rounded-2xl text-text-disabled hover:text-white hover:border-accent-primary/50 transition-all active:scale-90 shadow-premium flex items-center justify-center group/back"
              >
                <ArrowLeft size={20} className="group-hover/back:-translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button 
                onClick={onBack}
                className="p-4 bg-bg-secondary border border-border rounded-2xl text-text-disabled hover:text-white hover:border-accent-primary/50 transition-all active:scale-90 shadow-premium flex items-center justify-center group/back"
              >
                <ArrowLeft size={20} className="group-hover/back:-translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="p-2.5 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/10 group-hover/header:scale-110 transition-transform duration-500">
                <Icon size={24} />
              </div>
            )}
            <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none group-hover/header:translate-x-1 transition-transform duration-500">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-text-muted font-medium text-sm leading-relaxed max-w-2xl opacity-80 group-hover/header:translate-x-1 transition-transform duration-700 delay-75">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-auto flex items-center gap-4"
        >
          {action}
        </motion.div>
      )}
      
      {/* Subtle indicator of depth */}
      <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-gradient-to-r from-accent-primary to-transparent" />
    </header>
  );
};

export default PageHeader;
