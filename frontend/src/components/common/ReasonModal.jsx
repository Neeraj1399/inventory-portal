import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Send, CheckCircle2 } from "lucide-react";

// Premium Primitives
import Button from "./Button";

const ReasonModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Rejection Reason",
  description = "Please provide a reason for rejecting this request.",
  initialValue = "",
  mode = "INPUT", // 'INPUT' or 'VIEW'
  isLoading = false
}) => {
  const [reason, setReason] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setReason(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
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
                  <div className={`p-4 rounded-2xl shadow-inner border ${mode === "INPUT" ? "bg-status-danger/10 text-status-danger border-status-danger/10" : "bg-accent-primary/10 text-accent-primary border-accent-primary/10"}`}>
                    {mode === "INPUT" ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight">
                      {title}
                    </h3>
                    <p className="text-text-muted text-sm font-medium opacity-80">
                      {description}
                    </p>
                  </div>
                </div>

                {mode === "INPUT" ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group/textarea">
                      <textarea
                        autoFocus
                        required
                        placeholder="Provide justification statement..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full h-40 px-6 py-5 bg-bg-elevated border border-border rounded-[2rem] text-text-primary placeholder-text-disabled focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all resize-none font-medium leading-relaxed shadow-inner scrollbar-hide"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      disabled={!reason.trim()}
                      className="w-full h-16 tracking-widest text-[11px]"
                      icon={Send}
                    >
                      Transmit Resolution
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="p-8 bg-bg-elevated border border-border rounded-[2rem] shadow-inner relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <AlertCircle size={48} />
                      </div>
                      <p className="text-text-secondary italic leading-relaxed font-medium relative z-10">
                        "{reason || "No specific resolution record available."}"
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      className="w-full h-14 tracking-widest text-[11px]"
                    >
                      Dismiss View
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReasonModal;
