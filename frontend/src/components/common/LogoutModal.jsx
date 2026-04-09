import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Loader2, X } from "lucide-react";

// Premium Primitives
import Button from "./Button";

const LogoutModal = ({ isOpen, onConfirm, onCancel, isLoggingOut }) => {
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
            onClick={!isLoggingOut ? onCancel : undefined}
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
              {!isLoggingOut && (
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
                  <div className="absolute inset-0 bg-status-danger/15 rounded-full blur-[30px] animate-pulse" />
                  <div className="relative bg-bg-secondary border border-border w-full h-full rounded-3xl flex items-center justify-center text-status-danger shadow-sm">
                    {isLoggingOut ? (
                      <Loader2 className="animate-spin" size={40} />
                    ) : (
                      <LogOut size={40} />
                    )}
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-text-primary tracking-tight">
                    {isLoggingOut ? "Signing Out..." : "End Session"}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed font-medium px-4 opacity-80">
                    {isLoggingOut 
                      ? "Securely closing your workspace session. Please wait a moment." 
                      : "Are you sure you want to end your current session? You'll need to authenticate again to access the portal."}
                  </p>
                </div>

                {/* Action Buttons */}
                {!isLoggingOut && (
                  <div className="flex flex-col gap-4 pt-4">
                    <Button
                      variant="danger"
                      onClick={onConfirm}
                      className="w-full h-14 uppercase tracking-widest text-[11px]"
                    >
                      Confirm Logout
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={onCancel}
                      className="w-full h-14 uppercase tracking-widest text-[11px]"
                    >
                      Stay Authenticated
                    </Button>
                  </div>
                )}

                {/* Progress bar for logging out state */}
                {isLoggingOut && (
                  <div className="pt-8">
                    <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="h-full bg-status-danger shadow-glow"
                      />
                    </div>
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

export default LogoutModal;
