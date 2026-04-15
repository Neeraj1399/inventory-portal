import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Info, Loader2, X, CheckCircle2 } from "lucide-react";

// Premium Primitives
import Button from "./Button";

const ConfirmModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger", // 'danger', 'warning', 'info', 'success'
  isLoading = false,
  success = false,
  successTitle = "Action Completed",
  successMessage = "The operation was successful."
}) => {
  
  const getIcon = () => {
    if (success) return <CheckCircle2 size={40} className="text-status-success" />;
    switch (type) {
      case "danger": return <Trash2 size={32} />;
      case "warning": return <AlertTriangle size={32} />;
      case "info": return <Info size={32} />;
      case "success": return <CheckCircle2 size={32} />;
      default: return <Info size={32} />;
    }
  };

  const getVariantStyles = () => {
    switch (type) {
      case "danger": return {
        glow: "bg-status-danger/20",
        icon: "text-status-danger",
        btn: "danger"
      };
      case "warning": return {
        glow: "bg-status-warning/20",
        icon: "text-status-warning",
        btn: "warning"
      };
      case "info": return {
        glow: "bg-accent-primary/20",
        icon: "text-accent-primary",
        btn: "primary"
      };
      case "success": return {
        glow: "bg-status-success/20",
        icon: "text-status-success",
        btn: "success"
      };
      default: return {
        glow: "bg-bg-tertiary",
        icon: "text-text-muted",
        btn: "secondary"
      };
    }
  };

  const styles = getVariantStyles();

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
            onClick={!isLoading ? onCancel : undefined}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-bg-secondary border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              {!isLoading && !success && (
                <button 
                  onClick={onCancel}
                  className="absolute top-8 right-8 p-3 text-text-muted hover:text-white hover:bg-bg-tertiary rounded-2xl transition-all active:scale-95 z-10"
                >
                  <X size={20} />
                </button>
              )}

              <div className="p-12 text-center space-y-8">
                {/* Icon Wrapper */}
                <div className="relative mx-auto w-24 h-24">
                  <div className={`absolute inset-0 ${success ? "bg-status-success/20" : styles.glow} rounded-full blur-[40px] animate-pulse`} />
                  <div className={`relative bg-bg-elevated border border-border w-full h-full rounded-3xl flex items-center justify-center ${success ? "text-status-success" : styles.icon} shadow-inner`}>
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={40} />
                    ) : (
                      getIcon()
                    )}
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-text-primary tracking-tight">
                    {success ? successTitle : title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed font-medium px-4 opacity-80">
                    {success ? successMessage : message}
                  </p>
                </div>

                {/* Action Buttons */}
                {!isLoading && !success && (
                  <div className="flex flex-col gap-4 pt-4">
                    <Button
                      onClick={onConfirm}
                      className="w-full h-14 tracking-widest text-[11px]"
                    >
                      {confirmText}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={onCancel}
                      className="w-full h-14 tracking-widest text-[11px]"
                    >
                      {cancelText}
                    </Button>
                  </div>
                )}

                {/* Loading state indicator */}
                {isLoading && (
                  <div className="pt-8">
                    <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-full bg-accent-primary shadow-glow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Success state indicator */}
                {success && (
                  <div className="pt-4 text-[10px] font-black text-status-success/60 tracking-widest animate-pulse">
                    Sequence Complete
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

export default ConfirmModal;
