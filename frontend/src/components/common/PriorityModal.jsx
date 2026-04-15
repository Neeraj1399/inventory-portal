import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, CheckCircle2 } from "lucide-react";
import Button from "./Button";

const PriorityModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialPriority = "MEDIUM",
  isLoading = false
}) => {
  const [priority, setPriority] = useState(initialPriority);

  useEffect(() => {
    if (isOpen) setPriority(initialPriority);
  }, [isOpen, initialPriority]);

  const priorities = [
    { value: "LOW",    label: "Low Priority",    icon: Flag },
    { value: "MEDIUM", label: "Medium Priority",  icon: Flag },
    { value: "HIGH",   label: "High Priority",    icon: Flag },
  ];

  const getPriorityStyles = (value) => {
    switch (value) {
      case "LOW":    return "text-status-info    bg-status-info/10    border-status-info/30";
      case "MEDIUM": return "text-status-warning bg-status-warning/10 border-status-warning/30";
      case "HIGH":   return "text-status-danger  bg-status-danger/10  border-status-danger/30";
      default:       return "";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 bottom-0 right-0 left-0 md:left-20 lg:left-64 bg-bg-primary/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 sm:p-6"
          onClick={!isLoading ? onClose : undefined}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{ y: 40,  opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-bg-secondary border border-border w-full max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-8 space-y-5 sm:space-y-7">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="p-3 sm:p-4 rounded-2xl bg-accent-primary/10 text-accent-primary border border-accent-primary/10 shrink-0">
                  <Flag size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-text-primary tracking-tight leading-tight">
                    Adjust Priority
                  </h3>
                  <p className="text-text-muted text-xs sm:text-sm font-medium mt-0.5 opacity-80">
                    Recalibrate urgency for this request.
                  </p>
                </div>
                {!isLoading && (
                  <button
                    onClick={onClose}
                    className="p-2.5 text-text-muted hover:text-white hover:bg-bg-tertiary rounded-xl transition-all active:scale-95 shrink-0"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Priority Options */}
              <div className="space-y-3">
                {priorities.map((p) => {
                  const active = priority === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 sm:py-4 rounded-2xl border transition-all active:scale-[0.98] ${
                        active
                          ? `${getPriorityStyles(p.value)} shadow-sm ring-1 ring-white/5`
                          : "bg-bg-elevated/50 border-border text-text-muted hover:bg-bg-elevated"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-bg-tertiary shrink-0">
                          <p.icon size={16} className={active ? "" : "opacity-40"} />
                        </div>
                        <span className={`font-black text-[11px] tracking-widest ${active ? "" : "opacity-60"}`}>
                          {p.label}
                        </span>
                      </div>
                      {active && (
                        <div className="w-5 h-5 bg-bg-tertiary rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 size={13} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() => onConfirm(priority)}
                isLoading={isLoading}
                className="w-full h-12 sm:h-14 tracking-widest text-[11px]"
              >
                Confirm Priority Calibration
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PriorityModal;
