import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, CheckCircle2 } from "lucide-react";

// Premium Primitives
import Button from "./Button";
import Card from "./Card";

const PriorityModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialPriority = "MEDIUM",
  isLoading = false
}) => {
  const [priority, setPriority] = useState(initialPriority);

  useEffect(() => {
    if (isOpen) {
      setPriority(initialPriority);
    }
  }, [isOpen, initialPriority]);

  const priorities = [
    { value: "LOW", label: "Low Priority", variant: "info", icon: Flag },
    { value: "MEDIUM", label: "Medium Priority", variant: "warning", icon: Flag },
    { value: "HIGH", label: "High Priority", variant: "danger", icon: Flag }
  ];

  const handleConfirm = () => {
    onConfirm(priority);
  };

  const getPriorityStyles = (value) => {
    switch (value) {
      case "LOW": return "text-status-info bg-status-info/10 border-status-info/20";
      case "MEDIUM": return "text-status-warning bg-status-warning/10 border-status-warning/20";
      case "HIGH": return "text-status-danger bg-status-danger/10 border-status-danger/20";
      default: return "";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-primary/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
            onClick={!isLoading ? onClose : undefined}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-bg-secondary border border-border w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              {!isLoading && (
                <button 
                  onClick={onClose}
                  className="absolute top-8 right-8 p-3 text-text-muted hover:text-white hover:bg-bg-tertiary rounded-2xl transition-all active:scale-95 z-10"
                >
                  <X size={20} />
                </button>
              )}

              <div className="p-12 space-y-10">
                {/* Header */}
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-accent-primary/10 text-accent-primary shadow-inner border border-accent-primary/10">
                    <Flag size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight">
                      Adjust Priority
                    </h3>
                    <p className="text-text-muted text-sm font-medium opacity-80">
                      Recalibrate urgency for this request.
                    </p>
                  </div>
                </div>

                {/* Choices */}
                <div className="space-y-4">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all active:scale-[0.98] ${
                        priority === p.value 
                          ? `${getPriorityStyles(p.value)} shadow-premium ring-1 ring-white/5` 
                          : "bg-bg-elevated/50 border-border hover:border-border text-text-muted"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-xl ${priority === p.value ? "bg-bg-tertiary" : "bg-bg-tertiary"}`}>
                           <p.icon size={18} className={priority === p.value ? "" : "opacity-40"} />
                        </div>
                        <span className={`font-black text-xs uppercase tracking-widest ${priority === p.value ? "" : "opacity-60"}`}>
                          {p.label}
                        </span>
                      </div>
                      {priority === p.value && (
                        <div className="w-6 h-6 bg-bg-tertiary rounded-full flex items-center justify-center shadow-inner">
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <Button
                  onClick={handleConfirm}
                  isLoading={isLoading}
                  className="w-full h-16 uppercase tracking-widest text-[11px]"
                >
                  Confirm Priority Calibration
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PriorityModal;
